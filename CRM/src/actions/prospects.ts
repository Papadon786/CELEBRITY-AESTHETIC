"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { serializeDecimal } from "@/lib/serialize"
import {
  createProspectSchema,
  updateProspectSchema,
  type CreateProspectInput,
  type UpdateProspectInput,
} from "@/lib/validations/prospects"
import type { ProspectStage } from "@/types/database"

export async function getProspects(search?: string) {
  try {
    const where: any = {}
    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ]
    }

    const prospects = await prisma.prospect.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    })

    const serialized = prospects.map((p) => ({
      ...serializeDecimal(p, ["value"]),
      value: p.value ? Number(p.value) : 0,
    }))

    // Calculate KPI Stats
    const totalCount = serialized.length
    const inDemoCount = serialized.filter((p) => p.stage === "DEMO_BOOKED").length
    const inProposalCount = serialized.filter((p) => p.stage === "PROPOSAL_SENT").length
    const pipelineValue = serialized
      .filter((p) => p.stage !== "CLOSED_LOST")
      .reduce((sum, p) => sum + (p.value || 0), 0)

    const stages: Record<ProspectStage, typeof serialized> = {
      QUALIFIED: serialized.filter((p) => p.stage === "QUALIFIED"),
      DEMO_BOOKED: serialized.filter((p) => p.stage === "DEMO_BOOKED"),
      PROPOSAL_SENT: serialized.filter((p) => p.stage === "PROPOSAL_SENT"),
      NEGOTIATION: serialized.filter((p) => p.stage === "NEGOTIATION"),
      CLOSED_WON: serialized.filter((p) => p.stage === "CLOSED_WON"),
      CLOSED_LOST: serialized.filter((p) => p.stage === "CLOSED_LOST"),
    }

    return {
      success: true,
      data: serialized,
      stages,
      stats: {
        totalCount,
        inDemoCount,
        inProposalCount,
        pipelineValue,
      },
    }
  } catch (error: any) {
    console.error("[getProspects] Error:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch prospects",
      data: [],
      stages: {
        QUALIFIED: [],
        DEMO_BOOKED: [],
        PROPOSAL_SENT: [],
        NEGOTIATION: [],
        CLOSED_WON: [],
        CLOSED_LOST: [],
      },
      stats: { totalCount: 0, inDemoCount: 0, inProposalCount: 0, pipelineValue: 0 },
    }
  }
}

export async function createProspect(input: CreateProspectInput) {
  try {
    const user = await getCurrentUser()
    const parsed = createProspectSchema.parse(input)

    const prospect = await prisma.prospect.create({
      data: {
        name: parsed.name,
        company: parsed.company || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        stage: parsed.stage as any,
        value: parsed.value != null ? parsed.value : 0,
        icpScore: parsed.icpScore,
        engagement: parsed.engagement,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        assignedToId: parsed.assignedToId || user.id,
        notes: parsed.notes || null,
        treatmentCategory: parsed.treatmentCategory || null,
        treatmentInterest: parsed.treatmentInterest || null,
        candidateConcern: parsed.candidateConcern || null,
        doctorPreference: parsed.doctorPreference || null,
        leadId: parsed.leadId || null,
        activities: {
          create: {
            type: "STAGE_CHANGE",
            title: "Prospect Created",
            details: `Initialized in stage ${parsed.stage}`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/prospects")
    revalidatePath("/prospects")
    revalidatePath("/sales/leads")

    return { success: true, data: serializeDecimal(prospect, ["value"]) }
  } catch (error: any) {
    console.error("[createProspect] Error:", error)
    return { success: false, error: error.message || "Failed to create prospect" }
  }
}

export async function updateProspectStage(id: string, newStage: ProspectStage) {
  try {
    const user = await getCurrentUser()
    const existing = await prisma.prospect.findUnique({ where: { id } })
    if (!existing) throw new Error("Prospect not found")

    const oldStage = existing.stage

    const updated = await prisma.prospect.update({
      where: { id },
      data: {
        stage: newStage as any,
        activities: {
          create: {
            type: "STAGE_CHANGE",
            title: `Stage Changed`,
            details: `Moved from ${oldStage} to ${newStage}`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/prospects")
    revalidatePath("/prospects")

    return { success: true, data: serializeDecimal(updated, ["value"]) }
  } catch (error: any) {
    console.error("[updateProspectStage] Error:", error)
    return { success: false, error: error.message || "Failed to update prospect stage" }
  }
}

export async function updateProspect(input: UpdateProspectInput) {
  try {
    const user = await getCurrentUser()
    const { id, ...data } = updateProspectSchema.parse(input)

    const updateData: any = { ...data }
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate)

    const updated = await prisma.prospect.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/sales/prospects")
    revalidatePath("/prospects")

    return { success: true, data: serializeDecimal(updated, ["value"]) }
  } catch (error: any) {
    console.error("[updateProspect] Error:", error)
    return { success: false, error: error.message || "Failed to update prospect" }
  }
}

export async function deleteProspect(id: string) {
  try {
    await prisma.prospect.delete({ where: { id } })
    revalidatePath("/sales/prospects")
    revalidatePath("/prospects")
    return { success: true }
  } catch (error: any) {
    console.error("[deleteProspect] Error:", error)
    return { success: false, error: error.message || "Failed to delete prospect" }
  }
}

export async function convertProspectToClient(prospectId: string) {
  try {
    const user = await getCurrentUser()
    const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } })
    if (!prospect) throw new Error("Prospect not found")

    const renewalDate = new Date()
    renewalDate.setFullYear(renewalDate.getFullYear() + 1) // default 1-year renewal

    const client = await prisma.clientAccount.create({
      data: {
        name: prospect.name,
        company: prospect.company,
        email: prospect.email,
        phone: prospect.phone,
        status: "ACTIVE",
        healthScore: Math.min(100, (prospect.icpScore ?? 7) * 10),
        accountManagerId: user.id,
        accountManagerName: user.name,
        contractValue: prospect.value ?? 15000,
        renewalDate,
        renewalStage: "NOT_STARTED",
        membershipTier: prospect.treatmentInterest
          ? `${prospect.treatmentInterest} Retainer`
          : "Celebrity VIP Aesthetic Retainer",
        treatmentFocus: prospect.treatmentCategory || "Aesthetics & Trichology",
        boosterFrequency: "Quarterly",
        notes: prospect.notes ? `Converted from Prospect: ${prospect.notes}` : "Converted from Prospect",
        activities: {
          create: {
            type: "STATUS_CHANGE",
            title: "Client Account Activated",
            details: `Converted from won prospect ${prospect.name}`,
            authorId: user.id,
          },
        },
      },
    })

    await prisma.prospect.update({
      where: { id: prospect.id },
      data: {
        stage: "CLOSED_WON",
        convertedClientId: client.id,
        activities: {
          create: {
            type: "STAGE_CHANGE",
            title: "Converted to Client",
            details: `Created client account ${client.name}`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/prospects")
    revalidatePath("/prospects")
    revalidatePath("/sales/clients")
    revalidatePath("/clients")

    return { success: true, data: serializeDecimal(client, ["contractValue"]) }
  } catch (error: any) {
    console.error("[convertProspectToClient] Error:", error)
    return { success: false, error: error.message || "Failed to convert prospect to client" }
  }
}
