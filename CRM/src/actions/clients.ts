"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { serializeDecimal } from "@/lib/serialize"
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/lib/validations/clients"
import type { ClientStatus, RenewalStage } from "@/types/database"

export async function getClients(filters?: { search?: string; status?: string }) {
  try {
    const where: any = {}

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim()
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { accountManagerName: { contains: q, mode: "insensitive" } },
      ]
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status as ClientStatus
    }

    const [clients, allCounts] = await Promise.all([
      prisma.clientAccount.findMany({
        where,
        include: {
          accountManager: {
            select: { id: true, name: true, email: true },
          },
          patient: {
            select: { id: true, uhid: true, firstName: true, lastName: true },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: [{ status: "asc" }, { renewalDate: "asc" }, { createdAt: "desc" }],
      }),
      prisma.clientAccount.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ])

    const counts = {
      all: 0,
      active: 0,
      atRisk: 0,
      churned: 0,
      paused: 0,
    }

    for (const c of allCounts) {
      const cnt = c._count.id
      counts.all += cnt
      if (c.status === "ACTIVE") counts.active += cnt
      else if (c.status === "AT_RISK") counts.atRisk += cnt
      else if (c.status === "CHURNED") counts.churned += cnt
      else if (c.status === "PAUSED") counts.paused += cnt
    }

    const now = new Date()

    const serialized = clients.map((c) => {
      let isOverdue = false
      let daysDifference: number | null = null

      if (c.renewalDate) {
        const ren = new Date(c.renewalDate)
        const diffMs = ren.getTime() - now.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
        daysDifference = diffDays
        if (diffDays < 0 && c.renewalStage !== "CONFIRMED" && c.renewalStage !== "COMPLETED") {
          isOverdue = true
        }
      }

      return {
        ...serializeDecimal(c, ["contractValue"]),
        contractValue: c.contractValue ? Number(c.contractValue) : 0,
        renewalDate: c.renewalDate ? c.renewalDate.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        isOverdue,
        daysDifference,
      }
    })

    return {
      success: true,
      data: serialized,
      counts,
    }
  } catch (error: any) {
    console.error("[getClients] Error:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch clients",
      data: [],
      counts: { all: 0, active: 0, atRisk: 0, churned: 0, paused: 0 },
    }
  }
}

export async function createClient(input: CreateClientInput) {
  try {
    const user = await getCurrentUser()
    const parsed = createClientSchema.parse(input)

    const client = await prisma.clientAccount.create({
      data: {
        name: parsed.name,
        company: parsed.company || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        status: parsed.status,
        healthScore: parsed.healthScore,
        accountManagerName: parsed.accountManagerName || user.name,
        accountManagerId: parsed.accountManagerId || user.id,
        contractValue: parsed.contractValue,
        renewalDate: parsed.renewalDate ? new Date(parsed.renewalDate) : null,
        renewalStage: parsed.renewalStage,
        notes: parsed.notes || null,
        membershipTier: parsed.membershipTier || null,
        treatmentFocus: parsed.treatmentFocus || null,
        boosterFrequency: parsed.boosterFrequency || null,
        patientId: parsed.patientId || null,
        activities: {
          create: {
            type: "STATUS_CHANGE",
            title: "Client Created",
            details: `Onboarded client with initial status ${parsed.status}`,
            authorId: user.id,
          },
        },
      },
    })

    if (parsed.convertedFromProspectId) {
      await prisma.prospect.update({
        where: { id: parsed.convertedFromProspectId },
        data: { convertedClientId: client.id, stage: "CLOSED_WON" },
      })
    }

    revalidatePath("/sales/clients")
    revalidatePath("/clients")

    return { success: true, data: serializeDecimal(client, ["contractValue"]) }
  } catch (error: any) {
    console.error("[createClient] Error:", error)
    return { success: false, error: error.message || "Failed to create client" }
  }
}

export async function updateClientRenewalStage(id: string, stage: RenewalStage) {
  try {
    const user = await getCurrentUser()
    const existing = await prisma.clientAccount.findUnique({ where: { id } })
    if (!existing) throw new Error("Client account not found")

    const updated = await prisma.clientAccount.update({
      where: { id },
      data: {
        renewalStage: stage,
        activities: {
          create: {
            type: "RENEWAL_UPDATE",
            title: "Renewal Stage Updated",
            details: `Stage set to ${stage}`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/clients")
    revalidatePath("/clients")

    return { success: true, data: serializeDecimal(updated, ["contractValue"]) }
  } catch (error: any) {
    console.error("[updateClientRenewalStage] Error:", error)
    return { success: false, error: error.message || "Failed to update renewal stage" }
  }
}

export async function updateClientStatus(id: string, status: ClientStatus) {
  try {
    const user = await getCurrentUser()
    const existing = await prisma.clientAccount.findUnique({ where: { id } })
    if (!existing) throw new Error("Client account not found")

    const updated = await prisma.clientAccount.update({
      where: { id },
      data: {
        status,
        activities: {
          create: {
            type: "STATUS_CHANGE",
            title: "Client Status Changed",
            details: `Status changed from ${existing.status} to ${status}`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/clients")
    revalidatePath("/clients")

    return { success: true, data: serializeDecimal(updated, ["contractValue"]) }
  } catch (error: any) {
    console.error("[updateClientStatus] Error:", error)
    return { success: false, error: error.message || "Failed to update client status" }
  }
}

export async function updateClient(input: UpdateClientInput) {
  try {
    const user = await getCurrentUser()
    const { id, ...data } = updateClientSchema.parse(input)

    const updateData: any = { ...data }
    if (data.renewalDate) updateData.renewalDate = new Date(data.renewalDate)

    const updated = await prisma.clientAccount.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/sales/clients")
    revalidatePath("/clients")

    return { success: true, data: serializeDecimal(updated, ["contractValue"]) }
  } catch (error: any) {
    console.error("[updateClient] Error:", error)
    return { success: false, error: error.message || "Failed to update client" }
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.clientAccount.delete({ where: { id } })
    revalidatePath("/sales/clients")
    revalidatePath("/clients")
    return { success: true }
  } catch (error: any) {
    console.error("[deleteClient] Error:", error)
    return { success: false, error: error.message || "Failed to delete client" }
  }
}

export async function convertClientToPatient(clientId: string) {
  try {
    const user = await getCurrentUser()
    const client = await prisma.clientAccount.findUnique({ where: { id: clientId } })
    if (!client) throw new Error("Client account not found")

    if (client.patientId) {
      return { success: true, patientId: client.patientId, message: "Client is already linked to a patient profile" }
    }

    const nextVal = await prisma.counter.upsert({
      where: { key: "uhid" },
      update: { value: { increment: 1 } },
      create: { key: "uhid", value: 1001 },
    })
    const uhid = `CA-${String(nextVal.value).padStart(5, "0")}`

    const parts = client.name.trim().split(" ")
    const firstName = parts[0] || "Unknown"
    const lastName = parts.slice(1).join(" ") || null

    const patient = await prisma.patient.create({
      data: {
        uhid,
        firstName,
        lastName,
        phone: client.phone || "0000000000",
        email: client.email || null,
        status: "ACTIVE",
        registrationStatus: "CONFIRMED",
        registeredById: user.id,
        notes: {
          create: {
            body: `Registered from Corporate Client: ${client.name} (${client.company || "Direct"}). Contract value: ₹${client.contractValue}`,
            category: "FRONT_DESK",
            authorId: user.id,
          },
        },
      },
    })

    await prisma.clientAccount.update({
      where: { id: clientId },
      data: {
        patientId: patient.id,
        activities: {
          create: {
            type: "NOTE",
            title: `Linked to Clinic Patient (${patient.uhid})`,
            details: `Created medical patient record ${patient.firstName} ${patient.lastName || ""}`,
            authorId: user.id,
          },
        },
      },
    })

    revalidatePath("/sales/clients")
    revalidatePath("/clients")
    revalidatePath("/patients")

    return { success: true, patientId: patient.id, uhid: patient.uhid }
  } catch (error: any) {
    console.error("[convertClientToPatient] Error:", error)
    return { success: false, error: error.message || "Failed to convert client to patient" }
  }
}
