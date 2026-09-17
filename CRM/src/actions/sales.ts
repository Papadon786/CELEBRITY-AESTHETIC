"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole, getCurrentUser } from "@/lib/auth"
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
    safeRevalidate(["/sales", "/billing", "/payments", "/inventory", "/finance/dashboard"])
    return res
  })
}

export type SalesOrderRow = {
  id: string
  billNumber: string
  issuedAt: string
  patientName: string
  patientUhid: string
  patientPhone: string
  itemCount: number
  itemsSummary: string
  totalAmount: number
  discountAmount: number
  taxAmount: number
  netAmount: number
  paymentMethod: string
  receiptNumber: string
  status: string
  cashierName: string
}

/**
 * Retrieves sales orders with rich filtering capabilities.
 */
export async function getSalesOrders(params?: {
  period?: "today" | "yesterday" | "7days" | "30days" | "all"
  status?: string
  paymentMethod?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<{
  orders: SalesOrderRow[]
  total: number
  page: number
  pageSize: number
}> {
  const page = params?.page || 1
  const pageSize = params?.pageSize || 15
  const skip = (page - 1) * pageSize

  // Build where clause
  const where: any = {}

  if (params?.status && params.status !== "ALL") {
    where.status = params.status
  }

  // Date period
  if (params?.period && params.period !== "all") {
    const now = new Date()
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    if (params.period === "yesterday") {
      start.setDate(now.getDate() - 1)
      const end = new Date(start)
      end.setHours(23, 59, 59, 999)
      where.issuedAt = { gte: start, lte: end }
    } else if (params.period === "today") {
      where.issuedAt = { gte: start }
    } else if (params.period === "7days") {
      start.setDate(now.getDate() - 7)
      where.issuedAt = { gte: start }
    } else if (params.period === "30days") {
      start.setDate(now.getDate() - 30)
      where.issuedAt = { gte: start }
    }
  }

  // Search
  if (params?.search) {
    const q = params.search.trim()
    where.OR = [
      { billNumber: { contains: q, mode: "insensitive" } },
      { patient: { firstName: { contains: q, mode: "insensitive" } } },
      { patient: { lastName: { contains: q, mode: "insensitive" } } },
      { patient: { phone: { contains: q } } },
      { patient: { uhid: { contains: q, mode: "insensitive" } } },
      { payments: { some: { receiptNumber: { contains: q, mode: "insensitive" } } } },
    ]
  }

  // Payment method
  if (params?.paymentMethod && params.paymentMethod !== "ALL") {
    where.payments = {
      some: { method: params.paymentMethod as PaymentMethod },
    }
  }

  try {
    const [total, bills] = await Promise.all([
      prisma.bill.count({ where }),
      prisma.bill.findMany({
        where,
        include: {
          patient: {
            select: { firstName: true, lastName: true, uhid: true, phone: true },
          },
          items: true,
          payments: {
            include: { receivedBy: { select: { name: true } } },
            orderBy: { paidAt: "desc" },
          },
        },
        orderBy: { issuedAt: "desc" },
        skip,
        take: pageSize,
      }),
    ])

    const orders: SalesOrderRow[] = bills.map((b) => {
      const primaryPayment = b.payments?.[0]
      const itemsList = b.items || []
      const summary =
        itemsList.length <= 2
          ? itemsList.map((i) => `${i.description} (×${i.quantity})`).join(", ")
          : `${itemsList[0].description}, ${itemsList[1].description} +${itemsList.length - 2} more`

      return {
        id: b.id,
        billNumber: b.billNumber,
        issuedAt: b.issuedAt.toISOString(),
        patientName: `${b.patient?.firstName ?? "Customer"} ${b.patient?.lastName ?? ""}`.trim(),
        patientUhid: b.patient?.uhid ?? "—",
        patientPhone: b.patient?.phone ?? "—",
        itemCount: itemsList.length,
        itemsSummary: summary || "General Sale",
        totalAmount: Number(b.totalAmount),
        discountAmount: Number(b.discountAmount),
        taxAmount: Number(b.taxAmount),
        netAmount: Number(b.netAmount),
        paymentMethod: primaryPayment?.method ?? "CASH",
        receiptNumber: primaryPayment?.receiptNumber ?? "—",
        status: b.status,
        cashierName: primaryPayment?.receivedBy?.name ?? "Staff",
      }
    })

    return { orders, total, page, pageSize }
  } catch (err) {
    console.error("[getSalesLedger] Database query error:", err)
    return { orders: [], total: 0, page, pageSize }
  }
}

export type SalesAnalytics = {
  totalRevenue: number
  totalGross: number
  totalDiscounts: number
  totalTax: number
  orderCount: number
  averageOrderValue: number
  paymentMethodSplit: {
    method: string
    count: number
    total: number
    percentage: number
  }[]
  topSellingItems: {
    name: string
    quantity: number
    revenue: number
  }[]
}

/**
 * Computes sales analytics and KPIs.
 */
export async function getSalesAnalytics(period: "today" | "7days" | "30days" | "all" = "30days"): Promise<SalesAnalytics> {
  const where: any = {
    status: { in: ["PAID", "PARTIALLY_PAID"] },
  }

  if (period !== "all") {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    if (period === "today") {
      // start of today
    } else if (period === "7days") {
      start.setDate(start.getDate() - 7)
    } else if (period === "30days") {
      start.setDate(start.getDate() - 30)
    }
    where.issuedAt = { gte: start }
  }

  try {
    const bills = await prisma.bill.findMany({
      where,
      include: {
        items: true,
        payments: true,
      },
    })

    let totalRevenue = 0
    let totalGross = 0
    let totalDiscounts = 0
    let totalTax = 0
    const orderCount = bills.length

    const paymentStats: Record<string, { count: number; total: number }> = {
      CASH: { count: 0, total: 0 },
      UPI: { count: 0, total: 0 },
      CARD: { count: 0, total: 0 },
      NET_BANKING: { count: 0, total: 0 },
    }

    const itemStats: Record<string, { quantity: number; revenue: number }> = {}

    for (const b of bills) {
      const net = Number(b.netAmount)
      const gross = Number(b.totalAmount)
      const disc = Number(b.discountAmount)
      const tax = Number(b.taxAmount)

      totalRevenue += net
      totalGross += gross
      totalDiscounts += disc
      totalTax += tax

      for (const p of b.payments) {
        const m = p.method || "CASH"
        if (!paymentStats[m]) paymentStats[m] = { count: 0, total: 0 }
        paymentStats[m].count += 1
        paymentStats[m].total += Number(p.amount)
      }

      for (const it of b.items) {
        if (!itemStats[it.description]) {
          itemStats[it.description] = { quantity: 0, revenue: 0 }
        }
        itemStats[it.description].quantity += it.quantity
        itemStats[it.description].revenue += Number(it.amount)
      }
    }

    const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0

    const paymentMethodSplit = Object.entries(paymentStats)
      .filter(([, s]) => s.count > 0 || s.total > 0)
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        total: stats.total,
        percentage: totalRevenue > 0 ? Math.round((stats.total / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    const topSellingItems = Object.entries(itemStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)

    return {
      totalRevenue,
      totalGross,
      totalDiscounts,
      totalTax,
      orderCount,
      averageOrderValue,
      paymentMethodSplit,
      topSellingItems,
    }
  } catch (err) {
    console.error("[getSalesAnalytics] Database query error:", err)
    return {
      totalRevenue: 0,
      totalGross: 0,
      totalDiscounts: 0,
      totalTax: 0,
      orderCount: 0,
      averageOrderValue: 0,
      paymentMethodSplit: [],
      topSellingItems: [],
    }
  }
}

/**
 * Handles a sale return / refund:
 * - Marks Bill as REFUNDED
 * - Creates Refund record
 * - Restocks products into inventory
 */
export async function refundSale(billId: string, reason: string) {
  const user = await requireRole("ADMIN", "BILLING")

  return await prisma.$transaction(async (tx) => {
    const bill = await tx.bill.findUnique({
      where: { id: billId },
      include: { items: true, payments: true },
    })

    if (!bill) throw new Error("Bill not found.")
    if (bill.status === "REFUNDED") throw new Error("This sale has already been refunded.")

    const refundAmount = bill.netAmount
    const primaryPayment = bill.payments?.[0]

    // Create refund
    await tx.refund.create({
      data: {
        billId: bill.id,
        patientId: bill.patientId,
        paymentId: primaryPayment?.id,
        amount: refundAmount,
        reason: reason.trim() || "Customer return",
        method: primaryPayment?.method || "CASH",
        status: "COMPLETED",
        processedById: user.id,
        processedAt: new Date(),
      },
    })

    // Update bill
    await tx.bill.update({
      where: { id: bill.id },
      data: { status: "REFUNDED" },
    })

    // Restock any matching inventory items
    for (const it of bill.items) {
      const invItem = await tx.inventoryItem.findFirst({
        where: { name: it.description },
      })
      if (invItem) {
        const newStock = invItem.currentStock + it.quantity
        await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: { currentStock: newStock },
        })

        await tx.inventoryTransaction.create({
          data: {
            itemId: invItem.id,
            type: "RETURN",
            quantity: it.quantity,
            previousStock: invItem.currentStock,
            newStock,
            reason: `Sale Refund (${bill.billNumber}) - ${reason}`,
            patientId: bill.patientId,
            performedById: user.id,
          },
        })
      }
    }

    await logAudit({
      action: "REFUND_CREATED",
      entityType: "Refund",
      entityId: bill.id,
      metadata: { billNumber: bill.billNumber, refundAmount: Number(refundAmount), reason },
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      tx,
    })

    return { success: true }
  }).then((res) => {
    safeRevalidate(["/sales", "/billing", "/inventory", "/finance/dashboard"])
    return res
  })
}
