"use server"

import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations/tasks"

export async function createTask(input: CreateTaskInput) {
  const user = await getCurrentUser()
  const data = createTaskSchema.parse(input)

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      patientId: data.patientId || null,
      assignedToId: data.assignedToId || null,
      createdById: user.id,
    },
  })

  await logAudit({
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    metadata: { title: data.title, assignedToId: data.assignedToId },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/tasks")
  return toPlain(task)
}

export async function listTasks(filter: "mine" | "all" = "all") {
  const user = await getCurrentUser()
  const tasks = await prisma.task.findMany({
    where: filter === "mine" ? { assignedToId: user.id } : undefined,
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  })
  return toPlain(tasks)
}

export async function updateTaskStatus(id: string, status: "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED") {
  const user = await getCurrentUser()
  const task = await prisma.task.update({
    where: { id },
    data: { status, completedAt: status === "DONE" ? new Date() : null },
  })

  await logAudit({
    action: "TASK_STATUS_CHANGED",
    entityType: "Task",
    entityId: id,
    metadata: { status },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/tasks")
  return toPlain(task)
}

/** Reassigns a task to another staff member — a handoff. */
export async function handOffTask(id: string, assignedToId: string, note?: string) {
  const user = await getCurrentUser()
  const task = await prisma.task.update({
    where: { id },
    data: { assignedToId, status: "OPEN" },
  })

  await logAudit({
    action: "TASK_HANDED_OFF",
    entityType: "Task",
    entityId: id,
    metadata: { assignedToId, note },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/tasks")
  return toPlain(task)
}
