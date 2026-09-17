"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  Calendar,
  Clock,
  Stethoscope,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  Phone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { formatDateTime, formatDate } from "@/lib/format"
import {
  appointmentStatusColors,
  appointmentStatusLabels,
  appointmentTypeLabels,
  followUpStatusLabels,
} from "@/lib/labels"
import {
  cancelAppointment,
  checkInAppointment,
  confirmAppointment,
  rescheduleAppointment,
  type getAppointmentsForPatient,
} from "@/actions/appointments"
import { updateFollowUpStatus, type getPatientCrmData } from "@/actions/crm"
import { toast } from "sonner"

type Appointments = Awaited<ReturnType<typeof getAppointmentsForPatient>>
type FollowUps = Awaited<ReturnType<typeof getPatientCrmData>>["followUps"]

export function PatientAppointmentsTab({
  patientId,
  appointments,
  followUps = [],
}: {
  patientId: string
  appointments: Appointments
  followUps?: FollowUps
}) {
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-6">
      {/* ── 1. Header with Quick Booking CTA ───────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Appointments & Follow-up History</h2>
          <p className="text-sm text-muted-foreground">
            Complete schedule of past, active, and rescheduled appointments ({appointments.length} total).
          </p>
        </div>
        <Button
          className="gap-1.5 self-start sm:self-auto"
          nativeButton={false}
          render={
            <Link href={`/appointments?patientId=${patientId}&open=true`}>
              <Plus className="h-4 w-4" />
              Book Appointment
            </Link>
          }
        />
      </div>

      {/* ── 2. Appointments List ───────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Consultation Appointments</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{appointments.length} appointment(s)</span>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No appointments on record for this patient.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const isPending = apt.status === "PENDING"
                const canConfirm = isPending
                const canCheckIn = ["PENDING", "SCHEDULED", "CONFIRMED"].includes(apt.status)
                const canCancel = ["PENDING", "SCHEDULED", "CONFIRMED", "ARRIVED"].includes(apt.status)
                const canReschedule = ["PENDING", "SCHEDULED", "CONFIRMED", "ARRIVED"].includes(apt.status)

                return (
                  <div
                    key={apt.id}
                    className="rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors space-y-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {apt.service?.name || "Doctor Consultation"}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            ({apt.appointmentCode})
                          </span>
                          <Badge
                            variant="secondary"
                            className={appointmentStatusColors[apt.status] || "bg-muted"}
                          >
                            {appointmentStatusLabels[apt.status] || apt.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {apt.source === "WEBSITE" ? "🌐 Website Booking" : "🏥 Clinic Walk-in"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {formatDateTime(apt.scheduledAt)}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                            Dr. {apt.doctor.name}
                          </span>
                          {apt.durationMinutes && (
                            <>
                              <span>·</span>
                              <span>{apt.durationMinutes} mins</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        {canConfirm && (
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await confirmAppointment(apt.id)
                                  toast.success("Appointment confirmed")
                                } catch {
                                  toast.error("Could not confirm")
                                }
                              })
                            }
                            className="text-xs h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm
                          </Button>
                        )}

                        {canCheckIn && !canConfirm && (
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await checkInAppointment(apt.id)
                                  toast.success("Patient marked as Arrived")
                                } catch {
                                  toast.error("Could not check in")
                                }
                              })
                            }
                            className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark Arrived
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1"
                          nativeButton={false}
                          render={
                            <Link href={`/patients/${patientId}/encounters/new?appointmentId=${apt.id}`}>
                              <Stethoscope className="h-3.5 w-3.5" />
                              EMR
                            </Link>
                          }
                        />

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            {canReschedule && (
                              <DropdownMenuItem
                                onClick={() => setRescheduleId(apt.id)}
                                className="gap-2 text-xs"
                              >
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                Reschedule Appointment
                              </DropdownMenuItem>
                            )}
                            {canCancel && (
                              <DropdownMenuItem
                                onClick={() => setCancelId(apt.id)}
                                className="gap-2 text-xs text-destructive focus:text-destructive"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel Appointment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Booking Reason / Note */}
                    {apt.reason && (
                      <div className="p-2.5 rounded bg-muted/30 text-xs border text-muted-foreground">
                        <span className="font-semibold text-foreground">Patient Complaint / Reason: </span>
                        {apt.reason}
                      </div>
                    )}

                    {/* Cancellation details */}
                    {apt.cancelReason && (
                      <div className="p-2.5 rounded bg-red-50 text-red-800 border border-red-200 text-xs dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
                        <span className="font-semibold">Cancelled: </span>
                        {apt.cancelReason}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Scheduled CRM Follow-ups ────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-base font-semibold">Scheduled Follow-ups & Reminders</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{followUps.length} follow-up(s)</span>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No follow-ups currently scheduled for this patient.
            </p>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border p-3.5 bg-muted/10 space-y-2 text-xs hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        Due: {formatDate(f.dueDate)}
                      </span>
                      {f.reason && <Badge variant="outline">{f.reason}</Badge>}
                      <Badge
                        variant={
                          f.status === "DONE"
                            ? "default"
                            : f.status === "MISSED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {followUpStatusLabels[f.status] || f.status}
                      </Badge>
                    </div>

                    {f.assignedTo && (
                      <span className="text-muted-foreground">
                        Assigned to: <strong>{f.assignedTo.name}</strong>
                      </span>
                    )}
                  </div>

                  {f.notes && <p className="text-muted-foreground">{f.notes}</p>}

                  {f.status === "PENDING" && (
                    <div className="flex gap-2 pt-1 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            try {
                              await updateFollowUpStatus(f.id, "DONE")
                              toast.success("Follow-up marked as completed")
                            } catch {
                              toast.error("Could not update status")
                            }
                          })
                        }
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        Mark Done
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {cancelId && (
        <CancelModal
          open={Boolean(cancelId)}
          onOpenChange={(open) => !open && setCancelId(null)}
          appointmentId={cancelId}
        />
      )}

      {rescheduleId && (
        <RescheduleModal
          open={Boolean(rescheduleId)}
          onOpenChange={(open) => !open && setRescheduleId(null)}
          appointmentId={rescheduleId}
        />
      )}
    </div>
  )
}

function CancelModal({
  open,
  onOpenChange,
  appointmentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startTransition(async () => {
              try {
                await cancelAppointment(appointmentId, String(fd.get("reason") || ""))
                toast.success("Appointment cancelled")
                onOpenChange(false)
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not cancel appointment")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Reason for cancellation</Label>
            <Textarea
              id="cancel-reason"
              name="reason"
              required
              placeholder="e.g. Patient requested cancellation"
            />
          </div>
          <Button type="submit" variant="destructive" disabled={pending} className="w-full">
            {pending ? "Cancelling…" : "Cancel Appointment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RescheduleModal({
  open,
  onOpenChange,
  appointmentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const value = String(fd.get("scheduledAt") || "")
            startTransition(async () => {
              try {
                await rescheduleAppointment(appointmentId, new Date(value))
                toast.success("Appointment rescheduled successfully")
                onOpenChange(false)
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not reschedule appointment")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="scheduledAt">New Date & Time</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Confirm Reschedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
