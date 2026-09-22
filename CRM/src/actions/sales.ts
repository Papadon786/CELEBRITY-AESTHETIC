"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { generateBillNumber, generateReceiptNumber, generateUHID } from "@/lib/sequence"
import { serializeDecimal } from "@/lib/serialize"
import type { PaymentMethod } from "@/generated/prisma/enums"

function safeRevalidate(paths: string[]) {
  try {
    for (const p of paths) {
      revalidatePath(p)
    }
  } catch {
    // Ignored when running outside request context or in background scripts
  }
}

export type SalesCatalogItem = {
  id: string
  type: "SERVICE" | "PRODUCT"
  name: string
  category: string
  price: number
  sku?: string
  stock?: number
  unit?: string
  durationMinutes?: number
  description?: string
}

export type CreateSaleItemInput = {
  itemId: string
  type: "SERVICE" | "PRODUCT"
  name: string
  quantity: number
  unitPrice: number
  discountAmount: number
  taxRatePercent: number
}

export type CreateSaleInput = {
  patientId?: string
  walkInName?: string
  walkInPhone?: string
  items: CreateSaleItemInput[]
  discountAmount?: number
  notes?: string
  paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "SPLIT"
  splitPayments?: {
    cash?: number
    upi?: number
    card?: number
  }
  upiReference?: string
}

export type SalesReceiptData = {
  id: string
  billNumber: string
  receiptNumber: string
  issuedAt: string
  patientName: string
  patientUhid: string
  patientPhone: string
  cashierName: string
  items: {
    name: string
    quantity: number
    unitPrice: number
    discountAmount: number
    taxAmount: number
    total: number
  }[]
  totalAmount: number
  discountAmount: number
  taxAmount: number
  netAmount: number
  amountPaid: number
  paymentMethod: string
  notes?: string
}

/**
 * Fetches all sellable services and inventory products in one combined catalog.
 */
export async function getSalesCatalog(): Promise<SalesCatalogItem[]> {
  try {
    const [services, inventoryItems] = await Promise.all([
      prisma.service.findMany({
        where: { active: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
      prisma.inventoryItem.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),
    ])

    const serviceItems: SalesCatalogItem[] = services.map((s) => ({
      id: s.id,
      type: "SERVICE",
      name: s.name,
      category: "Clinical Services",
      price: Number(s.price ?? 0),
      durationMinutes: s.durationMinutes,
      description: s.shortDescription || s.description || undefined,
    }))

    const productItems: SalesCatalogItem[] = inventoryItems.map((item) => ({
      id: item.id,
      type: "PRODUCT",
      name: item.name,
      category: item.category || "Pharmacy & Products",
      price: Number(item.unitPrice ?? 0),
      sku: item.sku,
      stock: item.currentStock,
      unit: item.unit,
      description: item.description || undefined,
    }))

    return [...serviceItems, ...productItems]
  } catch (err) {
    console.error("[getSalesCatalog] Database query failed:", err)
    return []
  }
}

/**
 * Autocomplete patient lookup for the POS customer search bar.
 */
export async function searchSalesCustomers(query: string) {
  const q = query.trim()
  if (!q) return []

  const patients = await prisma.patient.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { uhid: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      uhid: true,
      phone: true,
    },
    take: 10,
  })

  return patients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName ?? ""}`.trim(),
    uhid: p.uhid,
    phone: p.phone,
  }))
}

/**
 * Atomically processes an instant sale / POS checkout:
 * - Links or registers patient
 * - Creates Bill and BillItem records
 * - Creates Payment record(s)
 * - Decrements inventory stock with audit transaction
 * - Returns printable receipt
 */
export async function createSale(input: CreateSaleInput): Promise<SalesReceiptData> {
  const currentUser = await getCurrentUser()

  if (!input.items || input.items.length === 0) {
    throw new Error("Cannot process a sale with an empty cart.")
  }

  // Validate items
  for (const it of input.items) {
    if (it.quantity <= 0) {
      throw new Error(`Quantity for "${it.name}" must be greater than zero.`)
    }
  }

  return await prisma.$transaction(async (tx) => {
    // Resolve valid staff user ID for database foreign keys
    const staffUser =
      (await tx.user.findUnique({ where: { id: currentUser.id }, select: { id: true } })) ||
      (await tx.user.findFirst({ select: { id: true } }))
    const validStaffId = staffUser?.id || null

    // 1. Resolve Patient ID
    let patientId = input.patientId
    let patientName = "Walk-in Customer"
    let patientUhid = "WALK-IN"
    let patientPhone = input.walkInPhone || "—"

    if (patientId) {
      const existing = await tx.patient.findUnique({
        where: { id: patientId },
        select: { id: true, firstName: true, lastName: true, uhid: true, phone: true },
      })
      if (!existing) throw new Error("Selected patient could not be found.")
      patientName = `${existing.firstName} ${existing.lastName ?? ""}`.trim()
      patientUhid = existing.uhid
      patientPhone = existing.phone
    } else {
      // Walk-in customer auto-registration or linking
      const name = input.walkInName?.trim() || "Walk-in Customer"
      const phone = input.walkInPhone?.trim() || "0000000000"

      const existingWalkin = await tx.patient.findFirst({
        where: { phone, source: "WALK_IN_SALE" },
        select: { id: true, firstName: true, lastName: true, uhid: true, phone: true },
      })

      if (existingWalkin) {
        patientId = existingWalkin.id
        patientName = `${existingWalkin.firstName} ${existingWalkin.lastName ?? ""}`.trim()
        patientUhid = existingWalkin.uhid
        patientPhone = existingWalkin.phone
      } else {
        const uhid = await generateUHID(tx)
        const newPatient = await tx.patient.create({
          data: {
            uhid,
            firstName: name,
            phone,
            source: "WALK_IN_SALE",
            registeredById: validStaffId,
          },
          select: { id: true, firstName: true, lastName: true, uhid: true, phone: true },
        })
        patientId = newPatient.id
        patientName = `${newPatient.firstName} ${newPatient.lastName ?? ""}`.trim()
        patientUhid = newPatient.uhid
        patientPhone = newPatient.phone
      }
    }

    // 2. Generate sequential codes
    const billNumber = await generateBillNumber(tx)
    const receiptNumber = await generateReceiptNumber(tx)

    // 3. Compute financial line totals
    let itemsGross = 0
    let itemsDiscount = 0
    let itemsTax = 0

    const billItemsData = input.items.map((it) => {
      const lineGross = it.unitPrice * it.quantity
      const lineDisc = Math.min(lineGross, Math.max(0, it.discountAmount || 0))
      const taxableAmount = lineGross - lineDisc
      const lineTax = (taxableAmount * (it.taxRatePercent || 0)) / 100
      const lineNet = taxableAmount + lineTax

      itemsGross += lineGross
      itemsDiscount += lineDisc
      itemsTax += lineTax

      return {
        description: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRatePercent: it.taxRatePercent || 0,
        taxAmount: lineTax,
        amount: lineNet,
        itemId: it.itemId,
        type: it.type,
      }
    })

    const overallDiscount = Math.max(0, input.discountAmount || 0)
    const totalDiscount = itemsDiscount + overallDiscount
    const netAmount = Math.max(0, itemsGross + itemsTax - totalDiscount)

    // 4. Create the Bill record
    const bill = await tx.bill.create({
      data: {
        billNumber,
        patientId,
        totalAmount: itemsGross,
        discountAmount: totalDiscount,
        taxAmount: itemsTax,
        netAmount,
        amountPaid: netAmount,
        balanceDue: 0,
        status: "PAID",
        items: {
          create: billItemsData.map((d) => ({
            description: d.description,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            taxRatePercent: d.taxRatePercent,
            taxAmount: d.taxAmount,
            amount: d.amount,
          })),
        },
      },
    })

    // 5. Create Payment record(s)
    if (input.paymentMethod === "SPLIT" && input.splitPayments) {
      const splits = input.splitPayments
      if (splits.cash && splits.cash > 0) {
        await tx.payment.create({
          data: {
            receiptNumber: `${receiptNumber}-A`,
            patientId,
            billId: bill.id,
            amount: splits.cash,
            method: "CASH",
            status: "SUCCESS",
            receivedById: validStaffId,
          },
        })
      }
      if (splits.upi && splits.upi > 0) {
        await tx.payment.create({
          data: {
            receiptNumber: `${receiptNumber}-B`,
            patientId,
            billId: bill.id,
            amount: splits.upi,
            method: "UPI",
            referenceNumber: input.upiReference || undefined,
            status: "SUCCESS",
            receivedById: validStaffId,
          },
        })
      }
      if (splits.card && splits.card > 0) {
        await tx.payment.create({
          data: {
            receiptNumber: `${receiptNumber}-C`,
            patientId,
            billId: bill.id,
            amount: splits.card,
            method: "CARD",
            status: "SUCCESS",
            receivedById: validStaffId,
          },
        })
      }
    } else {
      const method: PaymentMethod =
        input.paymentMethod === "SPLIT" ? "CASH" : (input.paymentMethod as PaymentMethod)

      await tx.payment.create({
        data: {
          receiptNumber,
          patientId,
          billId: bill.id,
          amount: netAmount,
          method,
          referenceNumber: input.upiReference || undefined,
          status: "SUCCESS",
          receivedById: validStaffId,
        },
      })
    }

    // 6. Update inventory for physical products sold
    for (const line of billItemsData) {
      if (line.type === "PRODUCT") {
        const item = await tx.inventoryItem.findUnique({
          where: { id: line.itemId },
        })

        if (item) {
          const newStock = Math.max(0, item.currentStock - line.quantity)
          await tx.inventoryItem.update({
            where: { id: item.id },
            data: { currentStock: newStock },
          })

          await tx.inventoryTransaction.create({
            data: {
              itemId: item.id,
              type: "STOCK_OUT",
              quantity: line.quantity,
              previousStock: item.currentStock,
              newStock,
              reason: `Counter Sale (${billNumber})`,
              patientId,
              performedById: validStaffId || currentUser.id,
            },
          })
        }
      }
    }

    // 7. Audit log
    await logAudit({
      action: "BILL_CREATED",
      entityType: "Bill",
      entityId: bill.id,
      metadata: {
        billNumber,
        receiptNumber,
        netAmount,
        itemCount: input.items.length,
        paymentMethod: input.paymentMethod,
        patientName,
      },
      userId: validStaffId ?? undefined,
      userName: currentUser.name,
      userRole: currentUser.role,
      tx,
    })

    return {
      id: bill.id,
      billNumber,
      receiptNumber,
      issuedAt: bill.issuedAt.toISOString(),
      patientName,
      patientUhid,
      patientPhone,
      cashierName: currentUser.name,
      items: billItemsData.map((it) => ({
        name: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountAmount: it.taxAmount,
        taxAmount: it.taxAmount,
        total: it.amount,
      })),
      totalAmount: itemsGross,
      discountAmount: totalDiscount,
      taxAmount: itemsTax,
      netAmount,
      amountPaid: netAmount,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
    }
  }).then((res) => {
    safeRevalidate(["/billing", "/payments", "/inventory", "/finance/dashboard"])
    return res
  })
}
