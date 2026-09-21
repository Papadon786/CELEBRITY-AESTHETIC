import { z } from "zod"

export const createPaymentPlanSchema = z.object({
  billId: z.string().min(1),
  downPayment: z.coerce.number().nonnegative().default(0),
  numberOfInstallments: z.coerce.number().int().min(2, "An EMI plan needs at least 2 installments"),
  startDate: z.coerce.date(),
  noCostEmi: z.boolean().default(true),
  notes: z.string().trim().optional(),
})
export type CreatePaymentPlanInput = z.infer<typeof createPaymentPlanSchema>

export const payInstallmentSchema = z.object({
  installmentId: z.string().min(1),
  referenceNumber: z.string().trim().optional(),
})
export type PayInstallmentInput = z.infer<typeof payInstallmentSchema>
