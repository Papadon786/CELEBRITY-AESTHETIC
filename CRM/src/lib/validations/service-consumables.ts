import { z } from "zod"

export const serviceConsumableSchema = z.object({
  serviceId: z.string().min(1),
  inventoryItemId: z.string().min(1),
  quantityPerProcedure: z.coerce.number().int().positive().default(1),
})
export type ServiceConsumableInput = z.infer<typeof serviceConsumableSchema>
