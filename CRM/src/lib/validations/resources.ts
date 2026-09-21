import { z } from "zod"

export const resourceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["ROOM", "EQUIPMENT"]),
  description: z.string().trim().optional(),
})
export type ResourceInput = z.infer<typeof resourceSchema>
