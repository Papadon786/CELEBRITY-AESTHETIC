"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { hashPassword, requireRole } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import { serializeDecimal } from "@/lib/serialize"
import type { StaffRole } from "@/types/database"

export type CreateStaffInput = {
  name: string
  email: string
  phone?: string
  password: string
  role: StaffRole
  specialization?: string
  consultationFee?: number
}

export type UpdateStaffInput = {
  name?: string
  phone?: string
  role?: StaffRole
  specialization?: string
  consultationFee?: number
  active?: boolean
}

export async function getStaffMembers() {
  await requireRole("ADMIN")

  const staff = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  })

  const staffWithCounts = await Promise.all(
    staff.map(async (s) => {
      const [appointmentsCount, encountersCount, patientsCount] = await Promise.all([
        prisma.appointment.count({ where: { doctorId: s.id } }),
        prisma.encounter.count({ where: { doctorId: s.id } }),
        prisma.patient.count({ where: { registeredById: s.id } }),
      ])
      return {
        ...s,
        _count: {
          appointmentsAsDoctor: appointmentsCount,
          encountersAsDoctor: encountersCount,
          registeredPatients: patientsCount,
        },
      }
    })
  )

  return staffWithCounts.map((s) => serializeDecimal(s, ["consultationFee"]))
}

export async function createStaffMember(input: CreateStaffInput) {
  const admin = await requireRole("ADMIN")

  const email = input.email.trim().toLowerCase()
  if (!email || !input.name.trim() || !input.password) {
    throw new Error("Name, email, and password are required")
  }

  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error(`A staff account with email ${email} already exists`)
  }

  const { data: authUser, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  })
  if (authError || !authUser?.user) {
    throw new Error(authError?.message || "Could not create the login account")
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || null,
      passwordHash: hashPassword(input.password),
      supabaseUserId: authUser.user.id,
      role: input.role,
      specialization: input.role === "DOCTOR" ? input.specialization?.trim() || null : null,
      consultationFee: input.role === "DOCTOR" && input.consultationFee ? input.consultationFee : null,
      active: true,
    },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: "STAFF_CREATED",
      entityType: "USER",
      entityId: user.id,
      userId: admin.id,
      userName: admin.name,
      metadata: {
        createdStaffName: user.name,
        createdStaffEmail: user.email,
        role: user.role,
      },
    },
  }).catch(() => {})

  revalidatePath("/settings/staff")
  revalidatePath("/appointments")
  revalidatePath("/queue")

  return serializeDecimal(user, ["consultationFee"])
}

export async function updateStaffMember(id: string, input: UpdateStaffInput) {
  const admin = await requireRole("ADMIN")

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name.trim()
  if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null
  if (input.role !== undefined) updateData.role = input.role
  if (input.specialization !== undefined) updateData.specialization = input.specialization?.trim() || null
  if (input.consultationFee !== undefined) updateData.consultationFee = input.consultationFee || null
  if (input.active !== undefined) updateData.active = input.active

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  await prisma.auditLog.create({
    data: {
      action: "STAFF_UPDATED",
      entityType: "USER",
      entityId: user.id,
      userId: admin.id,
      userName: admin.name,
      metadata: {
        updatedFields: Object.keys(updateData),
        staffEmail: user.email,
      },
    },
  }).catch(() => {})

  revalidatePath("/settings/staff")
  revalidatePath("/appointments")
  revalidatePath("/queue")

  return serializeDecimal(user, ["consultationFee"])
}

export async function toggleStaffStatus(id: string, active: boolean) {
  const admin = await requireRole("ADMIN")

  // Prevent admin from deactivating themselves
  if (id === admin.id) {
    throw new Error("You cannot deactivate your own admin account")
  }

  const user = await prisma.user.update({
    where: { id },
    data: { active },
  })

  // Lock/unlock their Supabase login in lockstep with the active flag
  if (user.supabaseUserId) {
    await getSupabaseAdmin()
      .auth.admin.updateUserById(user.supabaseUserId, { ban_duration: active ? "none" : "876000h" })
      .catch(() => {})
  }

  await prisma.auditLog.create({
    data: {
      action: active ? "STAFF_ACTIVATED" : "STAFF_DEACTIVATED",
      entityType: "USER",
      entityId: user.id,
      userId: admin.id,
      userName: admin.name,
      metadata: { staffEmail: user.email, active },
    },
  }).catch(() => {})

  revalidatePath("/settings/staff")
  return serializeDecimal(user, ["consultationFee"])
}

export async function resetStaffPassword(id: string, newPassword: string) {
  const admin = await requireRole("ADMIN")

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const existing = await prisma.user.findUniqueOrThrow({ where: { id } })

  if (existing.supabaseUserId) {
    const { error } = await getSupabaseAdmin().auth.admin.updateUserById(existing.supabaseUserId, { password: newPassword })
    if (error) throw new Error(error.message || "Could not update the login password")
  } else {
    // Legacy staff created before Supabase Auth was wired up — set up their login now.
    const { data: authUser, error } = await getSupabaseAdmin().auth.admin.createUser({
      email: existing.email,
      password: newPassword,
      email_confirm: true,
    })
    if (error || !authUser?.user) throw new Error(error?.message || "Could not create the login account")
    await prisma.user.update({ where: { id }, data: { supabaseUserId: authUser.user.id } })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { passwordHash: hashPassword(newPassword) },
  })

  await prisma.auditLog.create({
    data: {
      action: "STAFF_PASSWORD_RESET",
      entityType: "USER",
      entityId: user.id,
      userId: admin.id,
      userName: admin.name,
      metadata: { staffEmail: user.email },
    },
  }).catch(() => {})

  revalidatePath("/settings/staff")
  return { success: true }
}

export async function updateStaffPermissions(id: string, permissions: { allowedTabs: string[]; actionScopes: Record<string, boolean> }) {
  const admin = await requireRole("ADMIN")

  const user = await prisma.user.update({
    where: { id },
    data: { permissions },
  })

  await prisma.auditLog.create({
    data: {
      action: "STAFF_PERMISSIONS_UPDATED",
      entityType: "USER",
      entityId: user.id,
      userId: admin.id,
      userName: admin.name,
      metadata: {
        staffEmail: user.email,
        allowedTabsCount: permissions.allowedTabs.length,
        actionScopes: permissions.actionScopes,
      },
    },
  }).catch(() => {})

  revalidatePath("/settings/staff")
  revalidatePath("/", "layout")
  return serializeDecimal(user, ["consultationFee"])
}

/**
 * Ensures primary standard accounts exist in PostgreSQL database:
 * 1 Admin, 1 Doctor, 2 Receptionists (No Billing role)
 */
export async function syncDefaultStaffAccounts() {
  await requireRole("ADMIN")

  const defaultAccounts = [
    {
      name: "Clinic Administrator",
      email: "admin@zafoorclinic.com",
      phone: "8940399403",
      role: "ADMIN" as StaffRole,
      password: "Admin@123",
      specialization: null,
      consultationFee: null,
    },
    {
      name: "Dr. Mufeeda Roohi",
      email: "doctor@zafoorclinic.com",
      phone: "8940399403",
      role: "DOCTOR" as StaffRole,
      password: "Doctor@123",
      specialization: "Aesthetic Physician, Diabetologist & Family Physician",
      consultationFee: 500,
    },
    {
      name: "Front Desk Receptionist (Staff 1)",
      email: "reception1@zafoorclinic.com",
      phone: "8940399403",
      role: "RECEPTIONIST" as StaffRole,
      password: "Reception@123",
      specialization: null,
      consultationFee: null,
    },
    {
      name: "Patient Desk Receptionist (Staff 2)",
      email: "reception2@zafoorclinic.com",
      phone: "8940399403",
      role: "RECEPTIONIST" as StaffRole,
      password: "Reception@123",
      specialization: null,
      consultationFee: null,
    },
  ]

  const results: any[] = []
  for (const acc of defaultAccounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        phone: acc.phone,
        passwordHash: hashPassword(acc.password),
        role: acc.role,
        specialization: acc.specialization,
        consultationFee: acc.consultationFee,
        active: true,
      },
      create: {
        name: acc.name,
        email: acc.email,
        phone: acc.phone,
        passwordHash: hashPassword(acc.password),
        role: acc.role,
        specialization: acc.specialization,
        consultationFee: acc.consultationFee,
        active: true,
      },
    })
    results.push(serializeDecimal(user, ["consultationFee"]))
  }

  revalidatePath("/settings/staff")
  return { success: true, count: results.length }
}

export type StaffActivityItem = {
  id: string
  timestamp: Date
  staffName: string
  staffEmail: string
  staffRole: string
  category: "APPOINTMENT_SCHEDULED" | "WALK_IN_TOKEN" | "MEDICINE_DISPENSED" | "MEDICINE_RETURNED" | "PAYMENT_COLLECTED" | "PATIENT_REGISTERED" | "SYSTEM_AUDIT"
  title: string
  details: string
  patientUhid?: string | null
  patientName?: string | null
  amount?: number | null
  paymentMethod?: string | null
}

/**
 * Aggregates all staff actions across appointments, payments, inventory sales/returns, and audit logs.
 */
export async function getStaffActivityHistory(params?: { staffId?: string; limit?: number }): Promise<StaffActivityItem[]> {
  await requireRole("ADMIN")
  const limit = params?.limit || 50
  const staffId = params?.staffId

  const [payments, inventoryTx, appointments, auditLogs] = await Promise.all([
    // Payments collected
    prisma.payment.findMany({
      take: limit,
      orderBy: { paidAt: "desc" },
      where: staffId ? { receivedById: staffId } : undefined,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, uhid: true } },
        receivedBy: { select: { name: true, email: true, role: true } },
        bill: { select: { billNumber: true } },
      },
    }),
    // Medicine sales / returns
    prisma.inventoryTransaction.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      where: staffId ? { performedById: staffId } : undefined,
      include: {
        item: { select: { name: true, sku: true } },
        patient: { select: { firstName: true, lastName: true, uhid: true } },
        performedBy: { select: { name: true, email: true, role: true } },
      },
    }),
    // Appointments created
    prisma.appointment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      where: staffId ? { createdById: staffId } : undefined,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, uhid: true } },
        doctor: { select: { name: true } },
        createdBy: { select: { name: true, email: true, role: true } },
      },
    }),
    // Audit logs
    prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      where: staffId ? { userId: staffId } : undefined,
    }),
  ])

  const activityStream: StaffActivityItem[] = []

  // Payments
  for (const p of payments) {
    const pat = p.patient
    const patName = pat ? `${pat.firstName} ${pat.lastName || ""}`.trim() : "Patient"
    activityStream.push({
      id: `pay-${p.id}`,
      timestamp: new Date(p.paidAt),
      staffName: p.receivedBy?.name || "Staff Reception",
      staffEmail: p.receivedBy?.email || "staff@zafoorclinic.com",
      staffRole: p.receivedBy?.role || "RECEPTIONIST",
      category: "PAYMENT_COLLECTED",
      title: `Payment Recorded: ₹${Number(p.amount || 0)} (${p.method || "CASH"})`,
      details: `Received ₹${Number(p.amount || 0)} via ${p.method || "CASH"}${p.bill?.billNumber ? ` for Bill #${p.bill.billNumber}` : ""}`,
      patientUhid: pat?.uhid || null,
      patientName: patName,
      amount: Number(p.amount || 0),
      paymentMethod: p.method || "CASH",
    })
  }

  // Medicine Transactions
  for (const it of inventoryTx) {
    const isOut = it.type === "STOCK_OUT"
    const pat = it.patient
    const patName = pat ? `${pat.firstName} ${pat.lastName || ""}`.trim() : null
    const itemName = it.item?.name || "Medicine Item"
    activityStream.push({
      id: `inv-${it.id}`,
      timestamp: new Date(it.timestamp),
      staffName: it.performedBy?.name || "Staff Reception",
      staffEmail: it.performedBy?.email || "staff@zafoorclinic.com",
      staffRole: it.performedBy?.role || "RECEPTIONIST",
      category: isOut ? "MEDICINE_DISPENSED" : "MEDICINE_RETURNED",
      title: `${isOut ? "Medicine Dispensed/Sold" : "Medicine Returned"}: ${itemName} (${Math.abs(Number(it.quantity) || 0)} units)`,
      details: `${it.reason || (isOut ? "Prescription / counter sale" : "Patient stock return")}`,
      patientUhid: pat?.uhid ?? null,
      patientName: patName,
    })
  }

  // Appointments
  for (const apt of appointments) {
    const pat = apt.patient
    const patName = pat ? `${pat.firstName} ${pat.lastName || ""}`.trim() : "Patient"
    const isWalkIn = apt.type === "WALK_IN"
    const docName = apt.doctor?.name || "Dr. Mufeeda Roohi"
    const scheduledStr = apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString() : "Scheduled"
    activityStream.push({
      id: `apt-${apt.id}`,
      timestamp: new Date(apt.createdAt),
      staffName: apt.createdBy?.name || "Staff Reception",
      staffEmail: apt.createdBy?.email || "staff@zafoorclinic.com",
      staffRole: apt.createdBy?.role || "RECEPTIONIST",
      category: isWalkIn ? "WALK_IN_TOKEN" : "APPOINTMENT_SCHEDULED",
      title: `${isWalkIn ? "Walk-in Token Issued" : "Appointment Booked"}: ${apt.appointmentCode || ""}`,
      details: `Doctor: ${docName} · Date: ${scheduledStr}`,
      patientUhid: pat?.uhid || null,
      patientName: patName,
    })
  }

  // Audit logs
  for (const a of auditLogs) {
    activityStream.push({
      id: `aud-${a.id}`,
      timestamp: new Date(a.timestamp),
      staffName: a.userName || "System User",
      staffEmail: a.userRole || "",
      staffRole: a.userRole || "USER",
      category: "SYSTEM_AUDIT",
      title: `Action: ${(a.action || "").replace(/_/g, " ")}`,
      details: `Target: ${a.entityType || ""} ${a.entityId || ""}`,
    })
  }

  // Sort unified stream by newest first
  activityStream.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return activityStream.slice(0, limit)
}
