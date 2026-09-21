import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  dueDate: z.string().optional(),
  patientId: z.string().optional(),
  assignedToId: z.string().optional(),
})
export type CreateTaskInput = z.infer<typeof createTaskSchema>
