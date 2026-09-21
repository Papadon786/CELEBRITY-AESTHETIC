"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import { generatePurchaseOrderNumber } from "@/lib/sequence"
import { stockIn } from "@/actions/inventory"
import {
  supplierSchema,
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
  type SupplierInput,
  type CreatePurchaseOrderInput,
  type ReceivePurchaseOrderInput,
} from "@/lib/validations/purchase-orders"

// ── Suppliers ────────────────────────────────────────────────────────────

export async function getSuppliers(activeOnly = false) {
  return prisma.supplier.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  })
}

export async function createSupplier(input: SupplierInput) {
  const user = await requireRole("ADMIN")
  const data = supplierSchema.parse(input)
  const supplier = await prisma.supplier.create({ data })
  await logAudit({
    action: "SUPPLIER_CREATED",
    entityType: "Supplier",
    entityId: supplier.id,
    metadata: { name: supplier.name },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath("/inventory/suppliers")
  return supplier
}

export async function toggleSupplierActive(id: string, active: boolean) {
  await requireRole("ADMIN")
  await prisma.supplier.update({ where: { id }, data: { active } })
  revalidatePath("/inventory/suppliers")
}

// ── Purchase orders ─────────────────────────────────────────────────────

export async function getPurchaseOrders(status?: string) {
  const orders = await prisma.purchaseOrder.findMany({
    where: status ? { status: status as any } : undefined,
    include: { supplier: true, items: { include: { inventoryItem: true } } },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(orders)
}

export async function getPurchaseOrder(id: string) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { inventoryItem: true } } },
  })
  return toPlain(order)
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  const user = await requireRole("ADMIN", "RECEPTIONIST")
  const data = createPurchaseOrderSchema.parse(input)

  const order = await prisma.$transaction(async (tx) => {
    const poNumber = await generatePurchaseOrderNumber(tx)
    const created = await tx.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        status: "ORDERED",
        orderedAt: new Date(),
        expectedAt: data.expectedAt,
        notes: data.notes,
        createdById: user.id,
        items: {
          create: data.items.map((i) => ({
            inventoryItemId: i.inventoryItemId,
            quantityOrdered: i.quantityOrdered,
            unitCost: i.unitCost,
          })),
        },
      },
    })
    return created
  })

  await logAudit({
    action: "PURCHASE_ORDER_CREATED",
    entityType: "PurchaseOrder",
    entityId: order.id,
    metadata: { poNumber: order.poNumber, supplierId: data.supplierId, itemCount: data.items.length },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/inventory/purchase-orders")
  return toPlain(order)
}

/** Receiving stocks in each line item (optionally with batch/expiry) and marks the PO received/partially received. */
export async function receivePurchaseOrder(input: ReceivePurchaseOrderInput) {
  const user = await requireRole("ADMIN", "RECEPTIONIST")
  const data = receivePurchaseOrderSchema.parse(input)

  const po = await prisma.purchaseOrder.findUniqueOrThrow({
    where: { id: data.purchaseOrderId },
    include: { items: true },
  })
  if (po.status === "RECEIVED" || po.status === "CANCELLED") {
    throw new Error(`This purchase order is already ${po.status.toLowerCase()}`)
  }

  for (const line of data.items) {
    if (line.quantityReceived <= 0) continue
    const poItem = po.items.find((i) => i.id === line.purchaseOrderItemId)
    if (!poItem) continue

    await stockIn({
      itemId: poItem.inventoryItemId,
      quantity: line.quantityReceived,
      reason: `Received from PO ${po.poNumber}`,
      batchNumber: line.batchNumber,
      expiryDate: line.expiryDate,
    })

    await prisma.purchaseOrderItem.update({
      where: { id: poItem.id },
      data: { quantityReceived: { increment: line.quantityReceived } },
    })
  }

  const updatedItems = await prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId: po.id } })
  const fullyReceived = updatedItems.every((i) => i.quantityReceived >= i.quantityOrdered)
  const anyReceived = updatedItems.some((i) => i.quantityReceived > 0)

  const updated = await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: {
      status: fullyReceived ? "RECEIVED" : anyReceived ? "PARTIALLY_RECEIVED" : po.status,
      receivedAt: fullyReceived ? new Date() : po.receivedAt,
    },
  })

  await logAudit({
    action: "PURCHASE_ORDER_RECEIVED",
    entityType: "PurchaseOrder",
    entityId: po.id,
    metadata: { poNumber: po.poNumber, status: updated.status },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/inventory/purchase-orders")
  revalidatePath(`/inventory/purchase-orders/${po.id}`)
  return toPlain(updated)
}

export async function cancelPurchaseOrder(id: string, reason?: string) {
  const user = await requireRole("ADMIN")
  const order = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CANCELLED", notes: reason },
  })
  await logAudit({
    action: "PURCHASE_ORDER_CANCELLED",
    entityType: "PurchaseOrder",
    entityId: id,
    metadata: { reason },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath("/inventory/purchase-orders")
  return toPlain(order)
}
