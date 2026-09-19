"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { serializeDecimal } from "@/lib/serialize"
import {
  createLeadSchema,
  updateLeadSchema,
  type CreateLeadInput,
  type UpdateLeadInput,
  type LeadFilterInput,
} from "@/lib/validations/leads"
import type { LeadStatus, LeadSource } from "@/types/database"

export async function getLeads(filters: Partial<LeadFilterInput> = {}) {
  try {
    const user = await getCurrentUser()
    const where: any = {}

    if (filters.search && filters.search.trim() !== "") {
      const q = filters.search.trim()
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ]
    }

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status as LeadStatus
    }

    if (filters.source && filters.source !== "ALL") {
      where.source = filters.source as LeadSource
    }

    if (filters.assignedToId && filters.assignedToId !== "ALL") {
      where.assignedToId = filters.assignedToId
    }

    if (filters.view === "my") {
      where.assignedToId = user.id
    }

    let orderBy: any = { createdAt: "desc" }
    if (filters.sort === "oldest") {
      orderBy = { createdAt: "asc" }
    } else if (filters.sort === "value_desc") {
      orderBy = { value: "desc" }
    } else if (filters.sort === "value_asc") {
      orderBy = { value: "asc" }
    } else if (filters.sort === "followup_asc") {
      orderBy = { followUpDate: "asc" }
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        convertedPatient: {
          select: {
            id: true,
            uhid: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { activities: true },
        },
      },
      orderBy,
    })

    return leads.map((lead) => ({
      ...lead,
      value: lead.value ? Number(lead.value) : null,
      followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("[getLeads] Error:", error)
    return []
  }
}

export async function getLeadsSummary() {
  try {
    const user = await getCurrentUser()
    const now = new Date()

    const [allLeads, overdueCount] = await Promise.all([
      prisma.lead.findMany({
        select: {
          status: true,
          value: true,
          assignedToId: true,
        },
      }),
      prisma.lead.count({
        where: {
          followUpDate: {
            lt: now,
          },
          status: {
            notIn: ["WON", "LOST"],
          },
        },
      }),
    ])

    const counts: Record<string, number> = {
      ALL: allLeads.length,
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      DEMO: 0,
      PROPOSAL: 0,
      NEGOTIATION: 0,
      WON: 0,
      LOST: 0,
    }

    let totalPipelineValue = 0

    for (const lead of allLeads) {
      if (counts[lead.status] !== undefined) {
        counts[lead.status]++
      }
      if (lead.value && !["LOST"].includes(lead.status)) {
        totalPipelineValue += Number(lead.value)
      }
    }

    return {
      counts,
      totalPipelineValue,
      overdueCount,
    }
  } catch (error) {
    console.error("[getLeadsSummary] Error:", error)
    return {
      counts: {
        ALL: 0,
        NEW: 0,
        CONTACTED: 0,
        QUALIFIED: 0,
        DEMO: 0,
        PROPOSAL: 0,
        NEGOTIATION: 0,
        WON: 0,
        LOST: 0,
      },
      totalPipelineValue: 0,
      overdueCount: 0,
    }
  }
}

export async function getOverdueFollowUps(limit = 10) {
  try {
    const now = new Date()
    const overdueLeads = await prisma.lead.findMany({
      where: {
        followUpDate: {
          lt: now,
        },
        status: {
          notIn: ["WON", "LOST"],
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        followUpDate: "asc",
      },
      take: limit,
    })

    return overdueLeads.map((lead) => {
      const diffMs = now.getTime() - (lead.followUpDate?.getTime() || now.getTime())
      const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
      return {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        status: lead.status,
        value: lead.value ? Number(lead.value) : null,
        assignedTo: lead.assignedTo,
        followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
        overdueDays: diffDays,
      }
    })
  } catch (error) {
    console.error("[getOverdueFollowUps] Error:", error)
    return []
  }
}

export async function createLead(input: CreateLeadInput) {
  const user = await getCurrentUser()
  const data = createLeadSchema.parse(input)

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      source: data.source,
      sourceDetail: data.sourceDetail || null,
      value: data.value !== null && data.value !== undefined ? data.value : null,
      icpScore: data.icpScore ?? 5,
      assignedToId: data.assignedToId || null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes || null,
      activities: {
        create: {
          type: "STATUS_CHANGE",
          title: "Lead Created",
          details: `Initial status set to ${data.status} by ${user.name}`,
          authorId: user.id,
        },
      },
    },
  })

  revalidatePath("/sales/leads")
  return { success: true, leadId: lead.id }
}

export async function updateLeadStatus(id: string, newStatus: LeadStatus, reason?: string) {
  const user = await getCurrentUser()
  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { status: true, name: true },
  })

  if (!existing) {
    throw new Error("Lead not found")
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      status: newStatus,
      lostReason: newStatus === "LOST" ? reason || "Not specified" : null,
      activities: {
        create: {
          type: "STATUS_CHANGE",
          title: `Status updated to ${newStatus}`,
          details: `Changed from ${existing.status} to ${newStatus}${reason ? `. Reason: ${reason}` : ""}`,
          authorId: user.id,
        },
      },
    },
  })

  revalidatePath("/sales/leads")
  return { success: true }
}

export async function updateLead(input: UpdateLeadInput) {
  const user = await getCurrentUser()
  const data = updateLeadSchema.parse(input)
  const { id, ...rest } = data

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      name: rest.name,
      company: rest.company || null,
      email: rest.email || null,
      phone: rest.phone || null,
      status: rest.status,
      source: rest.source,
      sourceDetail: rest.sourceDetail || null,
      value: rest.value !== null && rest.value !== undefined ? rest.value : null,
      icpScore: rest.icpScore,
      assignedToId: rest.assignedToId || null,
      followUpDate: rest.followUpDate ? new Date(rest.followUpDate) : null,
      notes: rest.notes || null,
      lostReason: rest.lostReason || null,
      activities: {
        create: {
          type: "NOTE",
          title: "Lead Details Updated",
          details: `Information updated by ${user.name}`,
          authorId: user.id,
        },
      },
    },
  })

  revalidatePath("/sales/leads")
  return { success: true, leadId: updated.id }
}

export async function logLeadActivity(leadId: string, type: string, title: string, details?: string) {
  const user = await getCurrentUser()
  await prisma.leadActivity.create({
    data: {
      leadId,
      type,
      title,
      details: details || null,
      authorId: user.id,
    },
  })
  revalidatePath("/sales/leads")
  return { success: true }
}

export async function getLeadActivities(leadId: string) {
  const activities = await prisma.leadActivity.findMany({
    where: { leadId },
    include: {
      author: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return activities.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }))
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({
    where: { id },
  })
  revalidatePath("/sales/leads")
  return { success: true }
}

export async function convertLeadToPatient(leadId: string) {
  const user = await getCurrentUser()
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { convertedPatient: true },
  })

  if (!lead) {
    throw new Error("Lead not found")
  }

  if (lead.convertedPatientId) {
    return {
      success: true,
      alreadyConverted: true,
      patientId: lead.convertedPatientId,
    }
  }

  // Generate next UHID
  const nextVal = await prisma.counter.upsert({
    where: { key: "uhid" },
    update: { value: { increment: 1 } },
    create: { key: "uhid", value: 1001 },
  })
  const uhid = `CA-${String(nextVal.value).padStart(5, "0")}`

  // Split name
  const parts = lead.name.trim().split(" ")
  const firstName = parts[0] || "Unknown"
  const lastName = parts.slice(1).join(" ") || null

  const patient = await prisma.patient.create({
    data: {
      uhid,
      firstName,
      lastName,
      phone: lead.phone || "0000000000",
      email: lead.email || null,
      status: "ACTIVE",
      registrationStatus: user.role === "RECEPTIONIST" ? "LOCKED_FOR_RECEPTIONIST" : "CONFIRMED",
      registeredById: user.id,
      notes: {
        create: {
          body: `Converted from Sales Lead. Source: ${lead.source}${lead.notes ? `. Initial Lead Notes: ${lead.notes}` : ""}`,
          category: "FRONT_DESK",
          authorId: user.id,
        },
      },
    },
  })

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "WON",
      convertedPatientId: patient.id,
      activities: {
        create: {
          type: "STATUS_CHANGE",
          title: `Converted to Patient (${patient.uhid})`,
          details: `Lead marked as WON and registered as Patient ${patient.firstName} ${patient.lastName || ""} with UHID ${patient.uhid}`,
          authorId: user.id,
        },
      },
    },
  })

  revalidatePath("/sales/leads")
  revalidatePath("/patients")
  return { success: true, patientId: patient.id, uhid: patient.uhid }
}

export async function promoteLeadToProspect(leadId: string) {
  try {
    const user = await getCurrentUser()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new Error("Lead not found")

    // Check if prospect already exists
    const existing = await prisma.prospect.findFirst({ where: { leadId } })
    if (existing) {
      return { success: true, prospectId: existing.id, message: "Prospect already created for this lead" }
    }

    const prospect = await prisma.prospect.create({
      data: {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        stage: "QUALIFIED",
        value: lead.value ? Number(lead.value) : 25000,
        icpScore: lead.icpScore ?? 7,
        engagement: 35,
        dueDate: lead.followUpDate,
        assignedToId: lead.assignedToId || user.id,
        notes: lead.notes,
        leadId: lead.id,
        activities: {
          create: {
            type: "STAGE_CHANGE",
            title: "Promoted from Lead",
            details: `Promoted to Qualified Sales Prospect by ${user.name}`,
            authorId: user.id,
          },
        },
      },
    })

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "QUALIFIED",
        activities: {
          create: {
            type: "STATUS_CHANGE",
            title: "Promoted to Sales Prospect",
            details: `Advanced to Sales Qualified Pipeline (Prospect ID: ${prospect.id})`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/leads")
    revalidatePath("/sales/prospects")
    revalidatePath("/prospects")

    return { success: true, prospectId: prospect.id }
  } catch (error: any) {
    console.error("[promoteLeadToProspect] Error:", error)
    return { success: false, error: error.message || "Failed to promote lead to prospect" }
  }
}

export async function importLeadsBatch(leadsData: Array<{
  name: string
  company?: string
  email?: string
  phone?: string
  status?: string
  source?: string
  value?: number
  icpScore?: number
  followUpDays?: number
}>) {
  const user = await getCurrentUser()
  let importedCount = 0

  for (const item of leadsData) {
    if (!item.name || item.name.trim().length === 0) continue

    const followUpDate = item.followUpDays !== undefined
      ? new Date(Date.now() + item.followUpDays * 24 * 60 * 60 * 1000)
      : null

    const validStatus = (item.status && [
      "NEW", "CONTACTED", "QUALIFIED", "DEMO", "PROPOSAL", "NEGOTIATION", "WON", "LOST"
    ].includes(item.status.toUpperCase()))
      ? (item.status.toUpperCase() as LeadStatus)
      : "NEW"

    const validSource = (item.source && [
      "LINKEDIN", "WEBSITE", "INSTAGRAM", "GOOGLE", "REFERRAL", "WALK_IN", "PHONE", "OTHER"
    ].includes(item.source.toUpperCase()))
      ? (item.source.toUpperCase() as LeadSource)
      : "WEBSITE"

    await prisma.lead.create({
      data: {
        name: item.name.trim(),
        company: item.company?.trim() || null,
        email: item.email?.trim() || null,
        phone: item.phone?.trim() || null,
        status: validStatus,
        source: validSource,
        value: item.value ? item.value : null,
        icpScore: item.icpScore !== undefined ? Math.min(10, Math.max(0, item.icpScore)) : 5,
        followUpDate,
        assignedToId: user.id,
        activities: {
          create: {
            type: "STATUS_CHANGE",
            title: "Imported via CSV",
            details: `Imported by ${user.name}`,
            authorId: user.id,
          },
        },
      },
    })
    importedCount++
  }

  revalidatePath("/sales/leads")
  return { success: true, count: importedCount }
}
