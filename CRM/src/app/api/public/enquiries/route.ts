import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateAppointmentCode, generateUHID } from "@/lib/sequence"
import { error, json, preflight } from "../_lib"

export const dynamic = "force-dynamic"

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  return digits.length > 10 ? digits.slice(-10) : digits
}

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  patientName: z.string().trim().min(1).optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().min(1, "Phone number is required").optional(),
  patientPhone: z.string().trim().min(1).optional(),
  mobile: z.string().trim().min(1).optional(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  patientEmail: z.string().trim().email().optional().or(z.literal("")),
  treatment: z.string().trim().optional(),
  service: z.string().trim().optional(),
  serviceId: z.string().trim().optional(),
  date: z.string().trim().optional(),
  preferredDate: z.string().trim().optional(),
  time: z.string().trim().optional(),
  preferredTime: z.string().trim().optional(),
  startTime: z.string().trim().optional(),
  message: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  chiefComplaint: z.string().trim().optional(),
  source: z.string().trim().optional(),
})

/**
 * POST /api/public/enquiries
 * Captures all website enquiries, consultation requests, and contact forms
 * directly into the CRM (as a Lead in Sales Pipeline and a pending Appointment).
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return error(request, "Validation failed", 400, { fields: { body: "Request body must be valid JSON" } })
  }

  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "body")
      if (!fields[key]) fields[key] = issue.message
    }
    return error(request, "Validation failed", 400, { fields })
  }

  const data = parsed.data

  // Resolve composite fields
  const rawName =
    data.name ||
    data.patientName ||
    [data.firstName, data.lastName].filter(Boolean).join(" ") ||
    ""
  const rawPhone = data.phone || data.patientPhone || data.mobile || ""
  const email = (data.email || data.patientEmail || "").trim() || null
  const treatment = (data.treatment || data.service || "").trim()
  const dateStr = (data.date || data.preferredDate || "").trim()
  const timeStr = (data.time || data.preferredTime || data.startTime || "").trim()
  const message = (data.message || data.notes || data.chiefComplaint || "").trim()

  if (!rawName.trim()) {
    return error(request, "Validation failed", 400, { fields: { name: "Name is required" } })
  }

  const phone = normalisePhone(rawPhone)
  if (!phone || phone.length < 7) {
    return error(request, "Validation failed", 400, {
      fields: { phone: "A valid mobile phone number is required" },
    })
  }

  const nameParts = rawName.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(" ") || null

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create patient
      let patient = await tx.patient.findFirst({
        where: { phone },
        select: { id: true, uhid: true, firstName: true, lastName: true },
      })

      if (!patient) {
        const uhid = await generateUHID(tx)
        patient = await tx.patient.create({
          data: {
            uhid,
            firstName,
            lastName,
            phone,
            email,
            source: "WEBSITE",
            registrationStatus: "SUBMITTED",
            communicationPreference: {
              create: { preferredChannel: "WHATSAPP", allowWhatsapp: true, allowSms: true },
            },
          },
          select: { id: true, uhid: true, firstName: true, lastName: true },
        })
      } else if (email && !patient.id) {
        // update email if previously missing
        await tx.patient.update({
          where: { id: patient.id },
          data: { email },
        })
      }

      // 2. Match service
      let service: any = null
      if (data.serviceId) {
        service = await tx.service.findFirst({
          where: { id: data.serviceId, active: true },
        })
      }
      if (!service && treatment) {
        const slugAttempt = treatment.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        service = await tx.service.findFirst({
          where: {
            OR: [
              { slug: slugAttempt },
              { name: { contains: treatment, mode: "insensitive" } },
            ],
            active: true,
          },
        })
      }
      if (!service) {
        service = await tx.service.findFirst({
          where: { active: true },
          orderBy: { displayOrder: "asc" },
        })
      }

      // 3. Find active doctor
      const doctor = await tx.user.findFirst({
        where: { role: "DOCTOR", active: true },
        orderBy: { createdAt: "asc" },
      })

      // 4. Create Lead in Sales Pipeline
      const leadNotes = [
        treatment ? `Concern / Treatment: ${treatment}` : null,
        dateStr ? `Preferred Date: ${dateStr}` : null,
        timeStr ? `Preferred Time: ${timeStr}` : null,
        message ? `Enquiry Message: ${message}` : null,
      ]
        .filter(Boolean)
        .join("\n")

      const lead = await tx.lead.create({
        data: {
          name: rawName.trim(),
          phone,
          email,
          status: "NEW",
          source: "WEBSITE",
          sourceDetail: treatment ? `Website: ${treatment}` : "Website General Enquiry",
          notes: leadNotes,
          value: service?.price ?? 1500,
          icpScore: 8,
          assignedToId: doctor?.id || null,
          convertedPatientId: patient.id,
        },
      })

      // 5. Add initial Lead Activity
      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "NOTE",
          title: "Website Enquiry Received",
          details: `Patient submitted enquiry online.\nTreatment: ${treatment || "General Consultation"}\nDate: ${dateStr || "Flexible"} ${timeStr || ""}\nMessage: ${message || "None"}`,
        },
      })

      // 6. If date is provided, create a pending Appointment
      let appointment: any = null
      if (dateStr && doctor) {
        try {
          const timeToUse = timeStr && timeStr.includes(":") ? timeStr : "11:00"
          const scheduledAt = new Date(`${dateStr}T${timeToUse}:00`)

          if (!Number.isNaN(scheduledAt.getTime())) {
            const appointmentCode = await generateAppointmentCode(tx)
            appointment = await tx.appointment.create({
              data: {
                appointmentCode,
                patientId: patient.id,
                doctorId: doctor.id,
                serviceId: service?.id || null,
                scheduledAt,
                durationMinutes: service?.durationMinutes ?? 30,
                type: "IN_PERSON",
                status: "PENDING",
                source: "WEBSITE",
                reason: `Website enquiry: ${treatment || "Consultation"}${message ? ` - ${message}` : ""}`,
              },
              select: { appointmentCode: true, scheduledAt: true },
            })
          }
        } catch (apptErr) {
          console.warn("[public/enquiries] Appointment creation skipped:", apptErr)
        }
      }

      return {
        leadId: lead.id,
        patientUhid: patient.uhid,
        appointmentCode: appointment?.appointmentCode || null,
        scheduledAt: appointment?.scheduledAt?.toISOString() || null,
        serviceName: service?.name || treatment || "Consultation",
        doctorName: doctor?.name || "Crown Celebrity Team",
      }
    })

    return json(
      request,
      {
        success: true,
        message: "Enquiry successfully received by Crown Celebrity Aesthetic CRM",
        ...result,
      },
      201
    )
  } catch (err: any) {
    console.error("[public/enquiries] Submission failed:", err)
    return error(request, "Failed to submit enquiry. Please try again or WhatsApp us.", 500)
  }
}

export async function OPTIONS(request: Request) {
  return preflight(request)
}
