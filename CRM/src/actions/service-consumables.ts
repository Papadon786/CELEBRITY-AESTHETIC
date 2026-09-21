"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { serviceConsumableSchema, type ServiceConsumableInput } from "@/lib/validations/service-consumables"

export async function getServiceConsumables(serviceId: string) {
  return prisma.serviceConsumable.findMany({
    where: { serviceId },
    include: { inventoryItem: true },
    orderBy: { inventoryItem: { name: "asc" } },
  })
}

export async function addServiceConsumable(input: ServiceConsumableInput) {
  await requireRole("ADMIN")
  const data = serviceConsumableSchema.parse(input)
  const link = await prisma.serviceConsumable.upsert({
    where: { serviceId_inventoryItemId: { serviceId: data.serviceId, inventoryItemId: data.inventoryItemId } },
    create: data,
    update: { quantityPerProcedure: data.quantityPerProcedure },
  })
  revalidatePath("/services")
  return link
}

export async function removeServiceConsumable(id: string) {
  await requireRole("ADMIN")
  await prisma.serviceConsumable.delete({ where: { id } })
  revalidatePath("/services")
}
