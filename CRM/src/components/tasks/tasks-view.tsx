"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask, updateTaskStatus, handOffTask, type listTasks } from "@/actions/tasks"
import type { User } from "@/types/database"
import { formatDate } from "@/lib/format"

type Tasks = Awaited<ReturnType<typeof listTasks>>

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: "outline",
  NORMAL: "secondary",
  HIGH: "default",
  URGENT: "destructive",
}

export function TasksView({ tasks, staff, currentUserId }: { tasks: Tasks; staff: User[]; currentUserId: string }) {
  const [filter, setFilter] = useState<"all" | "mine">("all")
  const [createOpen, setCreateOpen] = useState(false)
  const visibleTasks = filter === "mine" ? tasks.filter((t) => t.assignedTo?.id === currentUserId) : tasks

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div className="flex items-center gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "mine" ? "default" : "outline"} size="sm" onClick={() => setFilter("mine")}>My Tasks</Button>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">No tasks yet.</CardContent>
          </Card>
        ) : (
          visibleTasks.map((t) => <TaskCard key={t.id} task={t} staff={staff} />)
        )}
      </div>

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} staff={staff} />
    </div>
  )
}

function TaskCard({ task, staff }: { task: Tasks[number]; staff: User[] }) {
  const [pending, startTransition] = useTransition()
  const [handoffOpen, setHandoffOpen] = useState(false)
  const router = useRouter()

  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{task.title}</p>
            {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
          </div>
          <Badge variant={priorityVariant[task.priority] ?? "outline"}>{task.priority}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Assigned: {task.assignedTo?.name ?? "Unassigned"}</span>
          <span>Created by: {task.createdBy?.name ?? "—"}</span>
          {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
          {task.patient && <span>Patient: {task.patient.firstName} {task.patient.lastName || ""}</span>}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
          {task.status !== "DONE" && task.status !== "CANCELLED" && (
            <>
              {task.status === "OPEN" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => startTransition(async () => { await updateTaskStatus(task.id, "IN_PROGRESS"); router.refresh() })}
                >
                  Start
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => startTransition(async () => { await updateTaskStatus(task.id, "DONE"); router.refresh() })}
              >
                Mark Done
              </Button>
              <Button size="sm" variant="outline" onClick={() => setHandoffOpen(true)}>Hand Off</Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => startTransition(async () => { await updateTaskStatus(task.id, "CANCELLED"); router.refresh() })}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <HandOffDialog taskId={task.id} open={handoffOpen} onOpenChange={setHandoffOpen} staff={staff} />
    </Card>
  )
}

function CreateTaskDialog({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (v: boolean) => void; staff: User[] }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL")
  const [assignedToId, setAssignedToId] = useState<string>("")
  const [dueDate, setDueDate] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Restock gauze in Room 2" />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority((v ?? "NORMAL") as typeof priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date (optional)</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assign To</Label>
            <Select value={assignedToId} onValueChange={(v) => setAssignedToId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            disabled={pending || !title}
            onClick={() =>
              startTransition(async () => {
                try {
                  await createTask({ title, description: description || undefined, priority, assignedToId: assignedToId || undefined, dueDate: dueDate || undefined })
                  toast.success("Task created")
                  onOpenChange(false)
                  setTitle("")
                  setDescription("")
                  setDueDate("")
                  setAssignedToId("")
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not create task")
                }
              })
            }
          >
            {pending ? "Creating…" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HandOffDialog({ taskId, open, onOpenChange, staff }: { taskId: string; open: boolean; onOpenChange: (v: boolean) => void; staff: User[] }) {
  const [assignedToId, setAssignedToId] = useState("")
  const [note, setNote] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hand Off Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>New Assignee</Label>
            <Select value={assignedToId} onValueChange={(v) => setAssignedToId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Handoff Note (optional)</Label>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={pending || !assignedToId}
            onClick={() =>
              startTransition(async () => {
                try {
                  await handOffTask(taskId, assignedToId, note || undefined)
                  toast.success("Task handed off")
                  onOpenChange(false)
                  setAssignedToId("")
                  setNote("")
                  router.refresh()
                } catch {
                  toast.error("Could not hand off task")
                }
              })
            }
          >
            {pending ? "Saving…" : "Hand Off"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
