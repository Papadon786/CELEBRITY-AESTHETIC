"use server"

import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/notifications"

/**
 * Sends a reminder for every appointment scheduled 20-28 hours from now that
 * hasn't already been reminded. Meant to be called once/hour by a cron job.
 */
export async function sendPreVisitReminders() {
  const now = new Date()
  const from = new Date(now.getTime() + 20 * 60 * 60 * 1000)
  const to = new Date(now.getTime() + 28 * 60 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: from, lte: to },
      status: { in: ["PENDING", "CONFIRMED"] },
      reminderSentAt: null,
    },
    include: { patient: true, doctor: true, service: true },
  })

  let sent = 0
  for (const appt of appointments) {
    const formattedDate = appt.scheduledAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    const message =
      `Hello ${appt.patient.firstName}, this is a reminder for your appointment ` +
      `(${appt.appointmentCode}) with Dr. ${appt.doctor.name}` +
      (appt.service ? ` for ${appt.service.name}` : "") +
      ` on ${formattedDate} at Crown Celebrity Aesthetic. See you soon!`

    try {
      if (appt.patient.phone) {
        await NotificationService.send("SMS", { to: { name: appt.patient.firstName, phone: appt.patient.phone }, message })
        await prisma.message.create({
          data: { patientId: appt.patientId, channel: "SMS", body: message, subject: "Appointment Reminder" },
        })
      }
      await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSentAt: new Date() } })
      sent++
    } catch (err) {
      console.error(`[sendPreVisitReminders] failed for appointment ${appt.id}:`, err)
    }
  }

  return { checked: appointments.length, sent }
}

/**
 * Sends an aftercare message ~1 hour after an appointment completes, once.
 */
export async function sendAftercareMessages() {
  const now = new Date()
  const from = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const to = new Date(now.getTime() - 1 * 60 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: from, lte: to },
      aftercareSentAt: null,
    },
    include: { patient: true, service: true },
  })

  let sent = 0
  for (const appt of appointments) {
    const message =
      `Hello ${appt.patient.firstName}, thank you for visiting Crown Celebrity Aesthetic today` +
      (appt.service ? ` for your ${appt.service.name}` : "") +
      `. Please follow your aftercare instructions and reach out if you notice anything unusual. ` +
      `Call us anytime at +91 9591047171.`

    try {
      if (appt.patient.phone) {
        await NotificationService.send("SMS", { to: { name: appt.patient.firstName, phone: appt.patient.phone }, message })
        await prisma.message.create({
          data: { patientId: appt.patientId, channel: "SMS", body: message, subject: "Aftercare Instructions" },
        })
      }
      await prisma.appointment.update({ where: { id: appt.id }, data: { aftercareSentAt: new Date() } })
      sent++
    } catch (err) {
      console.error(`[sendAftercareMessages] failed for appointment ${appt.id}:`, err)
    }
  }

  return { checked: appointments.length, sent }
}
