import { z } from "zod"

export const clientStatusEnum = z.enum(["ACTIVE", "AT_RISK", "CHURNED", "PAUSED"])
export const renewalStageEnum = z.enum([
  "NOT_STARTED",
  "IN_DISCUSSION",
  "PROPOSAL_SENT",
  "CONFIRMED",
  "COMPLETED",
])

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required"),
  company: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")).nullable(),
  phone: z.string().trim().optional().nullable(),
  status: clientStatusEnum.default("ACTIVE"),
  healthScore: z.coerce.number().min(0).max(100).default(50),
  accountManagerName: z.string().trim().optional().nullable(),
  accountManagerId: z.string().optional().nullable(),
  contractValue: z.coerce.number().min(0).default(0),
  renewalDate: z.string().optional().nullable(),
  renewalStage: renewalStageEnum.default("NOT_STARTED"),
  notes: z.string().trim().optional().nullable(),
  membershipTier: z.string().trim().optional().nullable(),
  treatmentFocus: z.string().trim().optional().nullable(),
  boosterFrequency: z.string().trim().optional().nullable(),
  convertedFromProspectId: z.string().optional().nullable(),
  patientId: z.string().optional().nullable(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string(),
})

export type UpdateClientInput = z.infer<typeof updateClientSchema>
