"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { generateReceiptNumber } from "@/lib/sequence"

export type PatientPaymentRow = {
  id: string
  billNumber: string
  amount: number
  paymentMethod: string
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED" | "REFUNDED"
  paidAt: string | null
  createdAt: string
  patientId: string
  patientFirstName: string
  patientLastName: string | null
  patientUhid: string
  recordedByName: string | null
}

export async function getPatientPayments(): Promise<PatientPaymentRow[]> {
  const bills = await prisma.bill.findMany({
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          uhid: true,
        },
      },
      payments: {
        include: {
          receivedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          paidAt: "desc",
        },
      },
    },
    orderBy: {
      issuedAt: "desc",
    },
  })

  return bills.map((b) => {
    const latestPayment = b.payments?.[0]
    return {
      id: b.id,
      billNumber: b.billNumber,
      amount: Number(b.netAmount),
      paymentMethod: latestPayment?.method ?? "—",
      status: b.status as any,
      paidAt: latestPayment?.paidAt ? new Date(latestPayment.paidAt).toISOString() : null,
      createdAt: b.issuedAt instanceof Date ? b.issuedAt.toISOString() : String(b.issuedAt),
      patientId: b.patientId,
      patientFirstName: b.patient?.firstName ?? "Unknown",
      patientLastName: b.patient?.lastName ?? null,
      patientUhid: b.patient?.uhid ?? "—",
      recordedByName: latestPayment?.receivedBy?.name ?? null,
    }
  })
}

export async function setPatientPaymentStatus(billId: string, status: "PAID" | "PENDING") {
  const user = await requireRole("ADMIN", "BILLING", "RECEPTIONIST")

  const bill = await prisma.bill.findUnique({
    where: { id: billId },
  })
  if (!bill) throw new Error("Bill not found")
  if (bill.status === "CANCELLED" || bill.status === "REFUNDED") {
    throw new Error("This bill is cancelled or refunded and can't be toggled here.")
  }
  if (bill.status === status) return

  const netAmount = Number(bill.netAmount)

  if (status === "PAID") {
    const remaining = netAmount - Number(bill.amountPaid)
    if (remaining > 0.01) {
      const receiptNumber = await generateReceiptNumber()
      await prisma.payment.create({
        data: {
          receiptNumber,
          patientId: bill.patientId,
          billId: bill.id,
          amount: remaining,
          method: "CASH",
          status: "SUCCESS",
          receivedById: user.id,
          paidAt: new Date(),
        },
      })
    }
    await prisma.bill.update({
      where: { id: billId },
      data: { status: "PAID", amountPaid: netAmount, balanceDue: 0 },
    })
  } else {
    await prisma.bill.update({
      where: { id: billId },
      data: { status: "PENDING", amountPaid: 0, balanceDue: netAmount },
    })
  }

  await logAudit({
    action: "PAYMENT_RECORDED",
    entityType: "Bill",
    entityId: billId,
    metadata: { netAmount, patientId: bill.patientId, status },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/payments")
  revalidatePath("/billing")
  revalidatePath(`/billing/${billId}`)
  revalidatePath(`/patients/${bill.patientId}`)
  revalidatePath("/finance/dashboard")
}
