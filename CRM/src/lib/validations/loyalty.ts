import { z } from "zod"

export const adjustLoyaltyPointsSchema = z.object({
  patientId: z.string().min(1),
  points: z.number().int().refine((n) => n !== 0, "Points cannot be zero"),
  reason: z.string().trim().min(1),
})
export type AdjustLoyaltyPointsInput = z.infer<typeof adjustLoyaltyPointsSchema>

export const redeemLoyaltyPointsSchema = z.object({
  patientId: z.string().min(1),
  points: z.number().int().positive(),
  reason: z.string().trim().min(1),
})
export type RedeemLoyaltyPointsInput = z.infer<typeof redeemLoyaltyPointsSchema>
