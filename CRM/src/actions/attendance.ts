"use server"

import { startOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import { requestLeaveSchema, type RequestLeaveInput } from "@/lib/validations/attendance"

export async function checkIn() {
  const user = await getCurrentUser()
  const today = startOfDay(new Date())

  const record = await prisma.staffAttendance.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { checkInAt: new Date(), status: "PRESENT" },
    create: { userId: user.id, date: today, checkInAt: new Date(), status: "PRESENT" },
  })

  await logAudit({
    action: "STAFF_CHECKED_IN",
    entityType: "StaffAttendance",
    entityId: record.id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/attendance")
  return toPlain(record)
}

export async function checkOut() {
  const user = await getCurrentUser()
  const today = startOfDay(new Date())

  const record = await prisma.staffAttendance.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { checkOutAt: new Date() },
    create: { userId: user.id, date: today, checkOutAt: new Date(), status: "PRESENT" },
  })

  await logAudit({
    action: "STAFF_CHECKED_OUT",
    entityType: "StaffAttendance",
    entityId: record.id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/attendance")
  return toPlain(record)
}

export async function getMyAttendance(monthDate: Date = new Date()) {
  const user = await getCurrentUser()
  const records = await prisma.staffAttendance.findMany({
    where: { userId: user.id, date: { gte: startOfMonth(monthDate), lte: endOfMonth(monthDate) } },
    orderBy: { date: "desc" },
  })
  return toPlain(records)
}

export async function requestLeave(input: RequestLeaveInput) {
  const user = await getCurrentUser()
  const data = requestLeaveSchema.parse(input)

  const request = await prisma.staffLeaveRequest.create({
    data: {
      userId: user.id,
      startDate: startOfDay(new Date(data.startDate)),
      endDate: startOfDay(new Date(data.endDate)),
      reason: data.reason,
    },
  })

  await logAudit({
    action: "STAFF_LEAVE_REQUESTED",
    entityType: "StaffLeaveRequest",
    entityId: request.id,
    metadata: { startDate: data.startDate, endDate: data.endDate },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/attendance")
  return toPlain(request)
}

export async function getMyLeaveRequests() {
  const user = await getCurrentUser()
  const requests = await prisma.staffLeaveRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(requests)
}

export async function getAllLeaveRequests() {
  await requireRole("ADMIN")
  const requests = await prisma.staffLeaveRequest.findMany({
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(requests)
}

export async function decideLeaveRequest(id: string, approve: boolean) {
  const admin = await requireRole("ADMIN")

  const request = await prisma.$transaction(async (tx) => {
    const existing = await tx.staffLeaveRequest.findUniqueOrThrow({ where: { id } })
    const updated = await tx.staffLeaveRequest.update({
      where: { id },
      data: { status: approve ? "APPROVED" : "REJECTED", decidedById: admin.id, decidedAt: new Date() },
    })

    if (approve) {
      const days = eachDayOfInterval({ start: existing.startDate, end: existing.endDate })
      for (const day of days) {
        const date = startOfDay(day)
        await tx.staffAttendance.upsert({
          where: { userId_date: { userId: existing.userId, date } },
          update: { status: "ON_LEAVE" },
          create: { userId: existing.userId, date, status: "ON_LEAVE" },
        })
      }
    }

    await logAudit({
      action: "STAFF_LEAVE_DECIDED",
      entityType: "StaffLeaveRequest",
      entityId: id,
      metadata: { approve },
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      tx,
    })

    return updated
  })

  revalidatePath("/attendance")
  return toPlain(request)
}

export async function getStaffAttendanceForDate(date: Date = new Date()) {
  await requireRole("ADMIN")
  const day = startOfDay(date)
  const [records, allStaff] = await Promise.all([
    prisma.staffAttendance.findMany({
      where: { date: day },
      include: { user: { select: { id: true, name: true, role: true } } },
    }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, role: true } }),
  ])

  const byUser = new Map(records.map((r) => [r.userId, r]))
  const rows = allStaff.map((s) => ({
    user: s,
    attendance: byUser.get(s.id) ?? null,
  }))

  return toPlain(rows)
}
