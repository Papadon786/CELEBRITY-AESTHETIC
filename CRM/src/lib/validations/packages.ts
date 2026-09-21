import { z } from "zod"

export const treatmentPackageSchema = z.object({
  name: z.string().trim().min(1, "Package name is required"),
  description: z.string().trim().optional(),
  serviceId: z.string().optional(),
  totalSessions: z.coerce.number().int().positive("Must be at least 1 session"),
  price: z.coerce.number().nonnegative(),
  validityDays: z.coerce.number().int().positive().optional(),
})
export type TreatmentPackageInput = z.infer<typeof treatmentPackageSchema>

export const assignPackageSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  packageId: z.string().min(1, "Select a package"),
  billId: z.string().optional(),
  sessionsTotal: z.coerce.number().int().positive().optional(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
})
export type AssignPackageInput = z.infer<typeof assignPackageSchema>

export const usePackageSessionSchema = z.object({
  patientPackageId: z.string().min(1),
  appointmentId: z.string().optional(),
  notes: z.string().trim().optional(),
})
export type UsePackageSessionInput = z.infer<typeof usePackageSessionSchema>
