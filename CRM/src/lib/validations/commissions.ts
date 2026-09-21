import { z } from "zod"

export const createCommissionSchema = z.object({
  userId: z.string().min(1, "Select a sales rep"),
  billId: z.string().optional(),
  saleAmount: z.coerce.number().positive("Sale amount must be greater than zero"),
  ratePercent: z.coerce.number().min(0).max(100).optional(),
  amount: z.coerce.number().positive("Commission amount must be greater than zero"),
  notes: z.string().trim().optional(),
})
export type CreateCommissionInput = z.infer<typeof createCommissionSchema>

export const salesTargetSchema = z.object({
  userId: z.string().min(1, "Select a sales rep"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  targetAmount: z.coerce.number().positive(),
  notes: z.string().trim().optional(),
})
export type SalesTargetInput = z.infer<typeof salesTargetSchema>
