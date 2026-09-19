import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateAppointmentCode, generateUHID } from "@/lib/sequence"
import { ACTIVE_STATUSES, error, json, preflight } from "../_lib"

export const dynamic = "force-dynamic"

const INDIAN_MOBILE = /^(?:\+?91)?[6-9]\d{9}$/

const SLOT_TAKEN = "This slot was just booked. Please choose another slot."

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  return digits.length > 10 ? digits.slice(-10) : digits
}

/** POST /api/public/appointments — public website booking & enquiry capture. */
export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return error(request, "Validation failed", 400, { fields: { body: "Request body must be valid JSON" } })
  }

  // Resolve flexible input fields from web
  const rawName =
    body.firstName ||
    body.patientName ||
    body.name ||
    ""
  const lastName = body.lastName || ""
  const fullName = [rawName, lastName].filter(Boolean).join(" ").trim()

  const rawPhone = body.phone || body.patientPhone || body.mobile || ""
  const phone = normalisePhone(rawPhone)

  if (!fullName) {
    return error(request, "Validation failed", 400, { fields: { firstName: "Name is required" } })
  }
  if (!phone || phone.length < 7) {
    return error(request, "Validation failed", 400, { fields: { phone: "A valid mobile phone number is required" } })
  }

  const email = (body.email || body.patientEmail || "").trim() || null
  const treatment = (body.treatment || body.service || "").trim()
  const dateStr = (body.date || body.preferredDate || "").trim()
  const timeStr = (body.time || body.startTime || body.preferredTime || "").trim()
  const reason = (body.reason || body.chiefComplaint || body.message || "").trim()

  // Resolve scheduledAt
  let scheduledAt: Date
  if (body.scheduledAt) {
    scheduledAt = new Date(body.scheduledAt)
  } else if (dateStr) {
    const t = timeStr && timeStr.includes(":") ? timeStr : "11:00"
    scheduledAt = new Date(`${dateStr}T${t}:00`)
  } else {
    // default to next business day at 11am if not specified
    const nextDay = new Date()
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(11, 0, 0, 0)
    scheduledAt = nextDay
  }

  if (Number.isNaN(scheduledAt.getTime())) {
    return error(request, "Validation failed", 400, { fields: { scheduledAt: "Invalid appointment time" } })
  }

  // Resolve Service
  let service: any = null
  if (body.serviceId) {
    service = await prisma.service.findFirst({
      where: { id: body.serviceId, active: true },
    })
  }
  if (!service && treatment) {
    const slugAttempt = treatment.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    service = await prisma.service.findFirst({
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
    service = await prisma.service.findFirst({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    })
  }

  // Resolve Doctor
  let doctor: any = null
  if (body.doctorId) {
    doctor = await prisma.user.findFirst({
      where: { id: body.doctorId, role: "DOCTOR", active: true },
    })
  }
  if (!doctor) {
    doctor = await prisma.user.findFirst({
      where: { role: "DOCTOR", active: true },
      orderBy: { createdAt: "asc" },
    })
  }

  if (!doctor) {
    return error(request, "Selected doctor is not available", 400)
  }

  const nameParts = fullName.split(/\s+/)
  const firstName = nameParts[0]
  const parsedLastName = nameParts.slice(1).join(" ") || null

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check conflict
      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId: doctor.id,
          scheduledAt,
          status: { in: [...ACTIVE_STATUSES] },
        },
        select: { id: true },
      })
      if (conflict) throw new Error(SLOT_TAKEN)

      // 2. Find or create patient
      let patient = await tx.patient.findFirst({
        where: { phone },
        select: { id: true, uhid: true },
      })

      if (!patient) {
        const uhid = await generateUHID(tx)
        patient = await tx.patient.create({
          data: {
            uhid,
            firstName,
            lastName: parsedLastName,
            phone,
            email,
            source: "WEBSITE",
            communicationPreference: {
              create: { preferredChannel: "WHATSAPP", allowWhatsapp: true, allowSms: true },
            },
          },
          select: { id: true, uhid: true },
        })
      }

      // 3. Create Appointment
      const appointmentCode = await generateAppointmentCode(tx)
      const appointment = await tx.appointment.create({
        data: {
          appointmentCode,
          patientId: patient.id,
          doctorId: doctor.id,
          serviceId: service?.id || null,
          scheduledAt,
          durationMinutes: body.durationMinutes ?? service?.durationMinutes ?? 30,
          type: "IN_PERSON",
          status: "PENDING",
          source: "WEBSITE",
          reason: reason || (treatment ? `Website enquiry: ${treatment}` : "Website consultation booking"),
        },
        select: { appointmentCode: true, scheduledAt: true },
      })

      // 4. Create Lead in CRM Sales Pipeline
      const lead = await tx.lead.create({
        data: {
          name: fullName,
          phone,
          email,
          status: "NEW",
          source: "WEBSITE",
          sourceDetail: treatment ? `Website Booking: ${treatment}` : "Website Appointment Booking",
          notes: [
            treatment ? `Treatment: ${treatment}` : null,
            `Scheduled: ${scheduledAt.toLocaleString("en-IN")}`,
            reason ? `Notes: ${reason}` : null,
          ].filter(Boolean).join("\n"),
          value: service?.price ?? 1500,
          icpScore: 8,
          assignedToId: doctor.id,
          convertedPatientId: patient.id,
        },
      })

      // 5. Add Lead Activity
      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "NOTE",
          title: "Website Appointment Booked",
          details: `Appointment booked online (${appointmentCode}) for ${scheduledAt.toLocaleString("en-IN")}.\nService: ${service?.name || "Consultation"}`,
        },
      })

      return { appointment, patientUhid: patient.uhid, leadId: lead.id }
    })

    return json(
      request,
      {
        success: true,
        appointmentCode: result.appointment.appointmentCode,
        patientUhid: result.patientUhid,
        leadId: result.leadId,
        service: service?.name || "Consultation",
        doctor: doctor.name,
        scheduledAt: result.appointment.scheduledAt.toISOString(),
      },
      201
    )
  } catch (e) {
    if (e instanceof Error && e.message === SLOT_TAKEN) {
      return error(request, SLOT_TAKEN, 409)
    }
    console.error("[public/appointments] booking failed", e)
    return error(request, "Could not create the appointment. Please try again.", 500)
  }
}

export async function OPTIONS(request: Request) {
  return preflight(request)
}
