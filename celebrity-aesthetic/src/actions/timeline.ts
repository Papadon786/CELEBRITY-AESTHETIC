"use server"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/format"
import { appointmentStatusLabels, appointmentTypeLabels, commChannelLabels } from "@/lib/labels"

export type TimelineEventType =
  | "APPOINTMENT"
  | "PRESCRIPTION"
  | "BILL"
  | "PAYMENT"
  | "REPORT"
  | "MESSAGE"
  | "NOTE"
  | "FEEDBACK"
  | "ENCOUNTER"
  | "CLINICAL_REPORT"
  | "REFERRAL"
  | "CERTIFICATE"

export type TimelineEvent = {
  id: string
  type: TimelineEventType
  date: Date
  title: string
  description?: string | null
  badge?: string
}

export async function getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
  const [
    appointments,
    prescriptions,
    bills,
    payments,
    reports,
    messages,
    notes,
    feedback,
    encounters,
    clinicalReports,
    referrals,
    certificates,
  ] = await Promise.all([
    prisma.appointment.findMany({ where: { patientId }, include: { doctor: true } }),
    prisma.prescription.findMany({ where: { patientId }, include: { doctor: true, items: true } }),
    prisma.bill.findMany({ where: { patientId } }),
    prisma.payment.findMany({ where: { patientId } }),
    prisma.document.findMany({
      where: { patientId, category: { in: ["LAB_REPORT"] } },
    }),
    prisma.message.findMany({ where: { patientId }, include: { sentBy: true } }),
    prisma.patientNote.findMany({ where: { patientId }, include: { author: true } }),
    prisma.feedback.findMany({ where: { patientId } }),
    prisma.encounter.findMany({ where: { patientId, status: "FINALIZED" }, include: { doctor: true, diagnoses: true } }),
    prisma.clinicalReport.findMany({ where: { patientId } }),
    prisma.referralNote.findMany({ where: { patientId }, include: { fromDoctor: true } }),
    prisma.certificate.findMany({ where: { patientId }, include: { doctor: true } }),
  ])

  const events: TimelineEvent[] = []

  for (const a of appointments) {
    events.push({
      id: `apt-${a.id}`,
      type: "APPOINTMENT",
      date: new Date(a.scheduledAt),
      title: `${appointmentTypeLabels[a.type] || "Appointment"} with Dr. ${a.doctor?.name || "Mufeeda Roohi"}`,
      description: a.reason ?? undefined,
      badge: appointmentStatusLabels[a.status] || a.status,
    })
  }

  for (const p of prescriptions) {
    events.push({
      id: `rx-${p.id}`,
      type: "PRESCRIPTION",
      date: new Date(p.issuedAt),
      title: `Prescription by Dr. ${p.doctor?.name || "Mufeeda Roohi"}`,
      description: (p.items || []).map((i: any) => i.medicineName).join(", ") || p.diagnosis || undefined,
    })
  }

  for (const b of bills) {
    events.push({
      id: `bill-${b.id}`,
      type: "BILL",
      date: new Date(b.issuedAt),
      title: `Bill ${b.billNumber} — ${formatCurrency(Number(b.netAmount))}`,
      badge: b.status,
    })
  }

  for (const p of payments) {
    events.push({
      id: `pay-${p.id}`,
      type: "PAYMENT",
      date: new Date(p.paidAt),
      title: `Payment of ${formatCurrency(Number(p.amount))} via ${p.method}`,
      badge: p.status,
    })
  }

  for (const r of reports) {
    events.push({
      id: `doc-${r.id}`,
      type: "REPORT",
      date: new Date(r.uploadedAt),
      title: r.title,
      badge: r.category,
    })
  }

  for (const m of messages) {
    events.push({
      id: `msg-${m.id}`,
      type: "MESSAGE",
      date: new Date(m.sentAt),
      title: `${commChannelLabels[m.channel] || m.channel} ${m.direction === "OUTBOUND" ? "sent" : "received"}`,
      description: m.body,
      badge: m.status,
    })
  }

  for (const n of notes) {
    events.push({
      id: `note-${n.id}`,
      type: "NOTE",
      date: new Date(n.createdAt),
      title: `Note by ${n.author?.name ?? "Staff"}`,
      description: n.body,
      badge: n.category,
    })
  }

  for (const f of feedback) {
    events.push({
      id: `fb-${f.id}`,
      type: "FEEDBACK",
      date: new Date(f.createdAt),
      title: `Feedback — ${f.rating}/5`,
      description: f.comment ?? undefined,
    })
  }

  for (const e of encounters) {
    const primaryDx = (e.diagnoses || []).find((d: any) => d.type === "PRIMARY") ?? e.diagnoses?.[0]
    events.push({
      id: `enc-${e.id}`,
      type: "ENCOUNTER",
      date: new Date(e.signedAt ?? e.encounterDate),
      title: `Consultation with Dr. ${e.doctor?.name || "Mufeeda Roohi"}`,
      description: primaryDx?.description ?? (e.chiefComplaints?.join(", ") || undefined),
      badge: "Signed",
    })
  }

  for (const r of clinicalReports) {
    events.push({
      id: `crep-${r.id}`,
      type: "CLINICAL_REPORT",
      date: new Date(r.reportDate),
      title: `${r.type === "LAB" ? "Lab Report" : "Radiology Report"} — ${r.title}`,
      description: r.impression ?? r.findings ?? undefined,
      badge: r.status,
    })
  }

  for (const r of referrals) {
    events.push({
      id: `ref-${r.id}`,
      type: "REFERRAL",
      date: new Date(r.createdAt),
      title: `Referred to ${r.toDoctor}${r.toSpecialty ? ` (${r.toSpecialty})` : ""}`,
      description: r.reason,
      badge: r.urgency,
    })
  }

  for (const c of certificates) {
    events.push({
      id: `cert-${c.id}`,
      type: "CERTIFICATE",
      date: new Date(c.createdAt),
      title: `${c.title} issued by Dr. ${c.doctor?.name || "Mufeeda Roohi"}`,
      badge: c.signedAt ? "Signed" : "Draft",
    })
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
