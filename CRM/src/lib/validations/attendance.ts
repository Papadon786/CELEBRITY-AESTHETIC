import { z } from "zod"

export const requestLeaveSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().trim().min(1),
})
export type RequestLeaveInput = z.infer<typeof requestLeaveSchema>
