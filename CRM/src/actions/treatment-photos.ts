"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import { addTreatmentPhotoSchema, type AddTreatmentPhotoInput } from "@/lib/validations/treatment-photos"

export async function getPatientTreatmentPhotos(patientId: string) {
  const photos = await prisma.treatmentPhoto.findMany({
    where: { patientId },
    include: { appointment: { include: { service: true } } },
    orderBy: { takenAt: "desc" },
  })
  return toPlain(photos)
}

export async function addTreatmentPhoto(input: AddTreatmentPhotoInput) {
  const user = await getCurrentUser()
  const data = addTreatmentPhotoSchema.parse(input)

  const photo = await prisma.treatmentPhoto.create({
    data: {
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      type: data.type,
      photoUrl: data.photoUrl,
      caption: data.caption,
      uploadedById: user.id,
    },
  })

  await logAudit({
    action: "TREATMENT_PHOTO_UPLOADED",
    entityType: "TreatmentPhoto",
    entityId: photo.id,
    metadata: { patientId: data.patientId, type: data.type },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/patients/${data.patientId}`)
  return toPlain(photo)
}

export async function deleteTreatmentPhoto(id: string) {
  const user = await getCurrentUser()
  const photo = await prisma.treatmentPhoto.delete({ where: { id } })
  await logAudit({
    action: "TREATMENT_PHOTO_DELETED",
    entityType: "TreatmentPhoto",
    entityId: id,
    metadata: { patientId: photo.patientId },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath(`/patients/${photo.patientId}`)
}
