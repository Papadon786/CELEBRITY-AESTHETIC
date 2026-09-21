import { z } from "zod"

export const addTreatmentPhotoSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().optional(),
  type: z.enum(["BEFORE", "AFTER"]),
  photoUrl: z.string().min(1),
  caption: z.string().trim().optional(),
})
export type AddTreatmentPhotoInput = z.infer<typeof addTreatmentPhotoSchema>
