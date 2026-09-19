import { z } from "zod"

export const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DEMO",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
])

export const leadSourceEnum = z.enum([
  "LINKEDIN",
  "WEBSITE",
  "INSTAGRAM",
  "GOOGLE",
  "REFERRAL",
  "WALK_IN",
  "PHONE",
  "OTHER",
])

export const createLeadSchema = z.object({
  name: z.string().min(2, "Lead contact name must be at least 2 characters"),
  company: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  status: leadStatusEnum.default("NEW"),
  source: leadSourceEnum.default("WEBSITE"),
  sourceDetail: z.string().optional().nullable(),
  value: z.coerce.number().min(0, "Value cannot be negative").optional().nullable(),
  icpScore: z.coerce.number().min(0).max(10).default(5),
  assignedToId: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string(),
  lostReason: z.string().optional().nullable(),
})

export const leadFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  assignedToId: z.string().optional(),
  view: z.enum(["all", "my"]).default("all"),
  sort: z.enum(["newest", "oldest", "value_desc", "value_asc", "followup_asc"]).default("newest"),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type LeadFilterInput = z.infer<typeof leadFilterSchema>
