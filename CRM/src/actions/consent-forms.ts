"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import {
  createConsentFormSchema,
  signConsentFormSchema,
  type CreateConsentFormInput,
  type SignConsentFormInput,
} from "@/lib/validations/consent-forms"

export async function getPatientConsentForms(patientId: string) {
  const forms = await prisma.consentForm.findMany({
    where: { patientId },
    include: { witnessedBy: true, appointment: true },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(forms)
}

export async function createConsentForm(input: CreateConsentFormInput) {
  const user = await getCurrentUser()
  const data = createConsentFormSchema.parse(input)

  const form = await prisma.consentForm.create({
    data: {
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      title: data.title,
      content: data.content,
      createdById: user.id,
    },
  })

  await logAudit({
    action: "CONSENT_FORM_CREATED",
    entityType: "ConsentForm",
    entityId: form.id,
    metadata: { patientId: data.patientId, title: data.title },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/patients/${data.patientId}`)
  return toPlain(form)
}

export async function signConsentForm(input: SignConsentFormInput) {
  const user = await getCurrentUser()
  const data = signConsentFormSchema.parse(input)

  const existing = await prisma.consentForm.findUniqueOrThrow({ where: { id: data.consentFormId } })
  if (existing.status !== "PENDING") {
    throw new Error(`This consent form is already ${existing.status.toLowerCase()}`)
  }

  const form = await prisma.consentForm.update({
    where: { id: data.consentFormId },
    data: {
      signatureUrl: data.signatureUrl,
      signedAt: new Date(),
      witnessedById: user.id,
      status: "SIGNED",
    },
  })

  await logAudit({
    action: "CONSENT_FORM_SIGNED",
    entityType: "ConsentForm",
    entityId: form.id,
    metadata: { patientId: form.patientId, title: form.title },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/patients/${form.patientId}`)
  return toPlain(form)
}

export async function declineConsentForm(id: string) {
  const user = await getCurrentUser()
  const form = await prisma.consentForm.update({ where: { id }, data: { status: "DECLINED" } })
  await logAudit({
    action: "CONSENT_FORM_DECLINED",
    entityType: "ConsentForm",
    entityId: id,
    metadata: { patientId: form.patientId },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath(`/patients/${form.patientId}`)
  return toPlain(form)
}
