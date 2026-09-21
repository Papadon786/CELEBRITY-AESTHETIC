import { z } from "zod"

export const createConsentFormSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Consent text is required"),
})
export type CreateConsentFormInput = z.infer<typeof createConsentFormSchema>

export const signConsentFormSchema = z.object({
  consentFormId: z.string().min(1),
  signatureUrl: z.string().min(1, "Signature is required"),
})
export type SignConsentFormInput = z.infer<typeof signConsentFormSchema>
