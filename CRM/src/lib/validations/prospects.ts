import { z } from "zod"

export const prospectStageEnum = z.enum([
  "QUALIFIED",
  "DEMO_BOOKED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
])

export const createProspectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  company: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")).nullable(),
  phone: z.string().trim().optional().nullable(),
  stage: prospectStageEnum.default("QUALIFIED"),
  value: z.coerce.number().min(0).optional().nullable(),
  icpScore: z.coerce.number().min(0).max(10).default(7),
  engagement: z.coerce.number().min(0).max(100).default(25),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  treatmentCategory: z.string().trim().optional().nullable(),
  treatmentInterest: z.string().trim().optional().nullable(),
  candidateConcern: z.string().trim().optional().nullable(),
  doctorPreference: z.string().trim().optional().nullable(),
  leadId: z.string().optional().nullable(),
})

export type CreateProspectInput = z.infer<typeof createProspectSchema>

export const updateProspectSchema = createProspectSchema.partial().extend({
  id: z.string(),
})

export type UpdateProspectInput = z.infer<typeof updateProspectSchema>
