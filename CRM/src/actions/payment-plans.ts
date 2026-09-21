"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import { collectPayment } from "@/actions/payments"
import {
  createPaymentPlanSchema,
  payInstallmentSchema,
  type CreatePaymentPlanInput,
  type PayInstallmentInput,
} from "@/lib/validations/payment-plans"

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function getPaymentPlanForBill(billId: string) {
  const plan = await prisma.paymentPlan.findUnique({
    where: { billId },
    include: { installments: { orderBy: { installmentNumber: "asc" } } },
  })
  return toPlain(plan)
}

export async function getPatientPaymentPlans(patientId: string) {
  const plans = await prisma.paymentPlan.findMany({
    where: { patientId },
    include: { installments: { orderBy: { installmentNumber: "asc" } }, bill: true },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(plans)
}

/** Every PENDING installment whose due date has passed, across all patients — the "who owes an EMI" list. */
export async function getOverdueInstallments() {
  const installments = await prisma.installment.findMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    include: { paymentPlan: { include: { patient: true, bill: true } } },
    orderBy: { dueDate: "asc" },
  })
  return toPlain(installments)
}

export async function createPaymentPlan(input: CreatePaymentPlanInput) {
  const user = await requireRole("ADMIN", "BILLING", "RECEPTIONIST")
  const data = createPaymentPlanSchema.parse(input)

  const bill = await prisma.bill.findUniqueOrThrow({ where: { id: data.billId } })
  const totalAmount = Number(bill.balanceDue)
  if (totalAmount <= 0) throw new Error("This bill has no outstanding balance to finance")
  if (data.downPayment > totalAmount) throw new Error("Down payment cannot exceed the outstanding balance")

  const existing = await prisma.paymentPlan.findUnique({ where: { billId: data.billId } })
  if (existing) throw new Error("This bill already has a payment plan")

  const financed = Math.round((totalAmount - data.downPayment) * 100) / 100
  const baseInstallment = Math.floor((financed / data.numberOfInstallments) * 100) / 100
  const lastInstallment = Math.round((financed - baseInstallment * (data.numberOfInstallments - 1)) * 100) / 100

  const plan = await prisma.$transaction(async (tx) => {
    const created = await tx.paymentPlan.create({
      data: {
        billId: data.billId,
        patientId: bill.patientId,
        totalAmount,
        downPayment: data.downPayment,
        numberOfInstallments: data.numberOfInstallments,
        noCostEmi: data.noCostEmi,
        notes: data.notes,
        createdById: user.id,
      },
    })

    await tx.installment.createMany({
      data: Array.from({ length: data.numberOfInstallments }, (_, i) => ({
        paymentPlanId: created.id,
        installmentNumber: i + 1,
        dueDate: addMonths(data.startDate, i),
        amount: i === data.numberOfInstallments - 1 ? lastInstallment : baseInstallment,
      })),
    })

    return created
  })

  if (data.downPayment > 0) {
    await collectPayment(data.billId, bill.patientId, {
      amount: data.downPayment,
      method: "EMI",
      referenceNumber: "Down payment",
    })
  }

  await logAudit({
    action: "PAYMENT_PLAN_CREATED",
    entityType: "PaymentPlan",
    entityId: plan.id,
    metadata: { billId: data.billId, totalAmount, numberOfInstallments: data.numberOfInstallments },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/billing/${data.billId}`)
  return toPlain(plan)
}

export async function payInstallment(input: PayInstallmentInput) {
  const user = await requireRole("ADMIN", "BILLING", "RECEPTIONIST")
  const data = payInstallmentSchema.parse(input)

  const installment = await prisma.installment.findUniqueOrThrow({
    where: { id: data.installmentId },
    include: { paymentPlan: true },
  })
  if (installment.status === "PAID") throw new Error("This installment is already paid")
  if (installment.status === "WAIVED") throw new Error("This installment was waived")

  const payment = await collectPayment(installment.paymentPlan.billId, installment.paymentPlan.patientId, {
    amount: Number(installment.amount),
    method: "EMI",
    referenceNumber: data.referenceNumber || `Installment ${installment.installmentNumber}`,
  })

  await prisma.installment.update({
    where: { id: installment.id },
    data: { status: "PAID", paidAt: new Date(), paymentId: payment.id },
  })

  const remaining = await prisma.installment.count({
    where: { paymentPlanId: installment.paymentPlanId, status: { not: "PAID" } },
  })
  if (remaining === 0) {
    await prisma.paymentPlan.update({ where: { id: installment.paymentPlanId }, data: { status: "COMPLETED" } })
  }

  await logAudit({
    action: "PAYMENT_PLAN_INSTALLMENT_PAID",
    entityType: "PaymentPlan",
    entityId: installment.paymentPlanId,
    metadata: { installmentNumber: installment.installmentNumber, amount: Number(installment.amount) },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/billing/${installment.paymentPlan.billId}`)
  return toPlain(installment)
}

export async function cancelPaymentPlan(id: string, reason?: string) {
  const user = await requireRole("ADMIN")
  const plan = await prisma.paymentPlan.update({
    where: { id },
    data: { status: "CANCELLED", notes: reason },
  })
  await logAudit({
    action: "PAYMENT_PLAN_CANCELLED",
    entityType: "PaymentPlan",
    entityId: id,
    metadata: { reason },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath(`/billing/${plan.billId}`)
  return toPlain(plan)
}
