"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { isToday } from "date-fns"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  XCircle,
  FileText,
  ExternalLink,
  Phone,
  Sparkles,
  MapPin,
  Tag,
} from "lucide-react"
import { formatDateTime, formatDate } from "@/lib/format"
import {
  appointmentStatusColors,
  appointmentStatusLabels,
  appointmentTypeLabels,
} from "@/lib/labels"
import {
  cancelAppointment,
  checkInAppointment,
  confirmAppointment,
  rescheduleAppointment,
  startConsultation,
} from "@/actions/appointments"
import type { getAppointments } from "@/actions/appointments"

type Appointments = Awaited<ReturnType<typeof getAppointments>>["appointments"]

export function AppointmentTable({ appointments }: { appointments: Appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">No appointments found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Adjust your filters or book a new appointment.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Patient & Contact</TableHead>
            <TableHead>Treatment / Service</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type & Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10 text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <AppointmentRow key={apt.id} appointment={apt} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AppointmentRow({ appointment: apt }: { appointment: Appointments[number] }) {
  const [pending, startTransition] = useTransition()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const isPending = apt.status === "PENDING"
  const canConfirm = isPending
  const canCheckIn = ["PENDING", "SCHEDULED", "CONFIRMED"].includes(apt.status)
  const canStartConsult = ["ARRIVED", "CONFIRMED", "PENDING"].includes(apt.status)
  const canCancel = ["PENDING", "SCHEDULED", "CONFIRMED", "ARRIVED"].includes(apt.status)
  const canReschedule = ["PENDING", "SCHEDULED", "CONFIRMED", "ARRIVED"].includes(apt.status)

  return (
    <>
      <TableRow className="hover:bg-muted/30 transition-colors">
        <TableCell>
          <div className="flex flex-col">
            <Link
              href={`/patients/${apt.patientId}`}
              className="font-semibold text-sm hover:text-primary hover:underline"
            >
              {apt.patient.firstName} {apt.patient.lastName || ""}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">{apt.patient.uhid}</span>
              {apt.patient.phone && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Phone className="h-3 w-3 inline" /> {apt.patient.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="space-y-0.5">
            <p className="font-medium text-sm text-foreground">
              {apt.service?.name || "Doctor Consultation"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {apt.appointmentCode}
              {apt.durationMinutes ? ` · ${apt.durationMinutes}m` : ""}
            </p>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-1.5 text-sm">
            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>Dr. {apt.doctor.name}</span>
          </div>
        </TableCell>

        <TableCell>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{formatDateTime(apt.scheduledAt)}</p>
            {isToday(apt.scheduledAt) && (
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                Today
              </Badge>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs font-medium">{appointmentTypeLabels[apt.type] || apt.type}</span>
            <Badge variant="outline" className="text-[10px] capitalize">
              {apt.source === "WEBSITE" ? "🌐 Website" : "🏥 Clinic"}
            </Badge>
          </div>
        </TableCell>

        <TableCell>
          <Badge variant="secondary" className={appointmentStatusColors[apt.status] || "bg-muted"}>
            {appointmentStatusLabels[apt.status] || apt.status}
          </Badge>
        </TableCell>

        <TableCell className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted" aria-label="Appointment Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setDetailsOpen(true)} className="gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                View Full Details
              </DropdownMenuItem>

              <DropdownMenuItem
                render={
                  <Link href={`/patients/${apt.patientId}`} className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Patient Profile
                  </Link>
                }
              />

              <DropdownMenuSeparator />

              {canConfirm && (
                <DropdownMenuItem
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await confirmAppointment(apt.id)
                        toast.success("Appointment confirmed")
                      } catch {
                        toast.error("Could not confirm appointment")
                      }
                    })
                  }
                  className="gap-2 text-indigo-600 focus:text-indigo-700 font-medium"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Appointment
                </DropdownMenuItem>
              )}

              {canCheckIn && (
                <DropdownMenuItem
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
                  className="gap-2 text-emerald-600 focus:text-emerald-700 font-medium"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Check In / Arrived
                </DropdownMenuItem>
              )}

              {canStartConsult && (
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/patients/${apt.patientId}/encounters/new?appointmentId=${apt.id}`}
                      className="flex items-center gap-2 w-full text-primary font-medium"
                    >
                      <Stethoscope className="h-4 w-4" />
                      Start Consultation (EMR)
                    </Link>
                  }
                />
              )}

              {canReschedule && (
                <DropdownMenuItem onClick={() => setRescheduleOpen(true)} className="gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Reschedule
                </DropdownMenuItem>
              )}

              {canCancel && (
                <DropdownMenuItem
                  onClick={() => setCancelOpen(true)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Appointment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AppointmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appointment={apt}
        onRescheduleClick={() => {
          setDetailsOpen(false)
          setRescheduleOpen(true)
        }}
        onCancelClick={() => {
          setDetailsOpen(false)
          setCancelOpen(true)
        }}
      />
      <CancelDialog open={cancelOpen} onOpenChange={setCancelOpen} appointmentId={apt.id} />
      <RescheduleDialog open={rescheduleOpen} onOpenChange={setRescheduleOpen} appointmentId={apt.id} />
    </>
  )
}

function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment: apt,
  onRescheduleClick,
  onCancelClick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointments[number]
  onRescheduleClick: () => void
  onCancelClick: () => void
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appointment Details
            </DialogTitle>
            <Badge variant="secondary" className={appointmentStatusColors[apt.status] || "bg-muted"}>
              {appointmentStatusLabels[apt.status] || apt.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm pt-2">
          {/* Patient Card */}
          <div className="rounded-lg border p-3.5 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base text-foreground">
                  {apt.patient.firstName} {apt.patient.lastName || ""}
                </p>
                <p className="text-xs text-muted-foreground font-mono">UHID: {apt.patient.uhid}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                nativeButton={false}
                render={
                  <Link href={`/patients/${apt.patientId}`}>
                    Profile <ExternalLink className="h-3 w-3" />
                  </Link>
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span className="font-medium">{apt.patient.phone || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium">{apt.patient.email || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gender: </span>
                <span className="font-medium">{apt.patient.gender || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Source: </span>
                <span className="font-medium">{apt.source === "WEBSITE" ? "Online Website" : "CRM Clinic"}</span>
              </div>
            </div>
          </div>

          {/* Consultation & Doctor Info */}
          <div className="rounded-lg border p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono font-medium">
                Code: {apt.appointmentCode}
              </span>
              <Badge variant="outline" className="text-xs">
                {appointmentTypeLabels[apt.type] || apt.type}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Treatment / Service:</span>
                <span className="font-semibold text-foreground">
                  {apt.service?.name || "General Doctor Consultation"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Consulting Physician:</span>
                <span className="font-semibold text-foreground">Dr. {apt.doctor.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Scheduled Date & Time:</span>
                <span className="font-semibold text-foreground">{formatDateTime(apt.scheduledAt)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Duration:</span>
                <span>{apt.durationMinutes || 30} minutes</span>
              </div>
            </div>

            {apt.reason && (
              <div className="p-2.5 rounded bg-muted/40 text-xs space-y-1 mt-2">
                <span className="font-semibold text-foreground">Booking Note / Reason:</span>
                <p className="text-muted-foreground">{apt.reason}</p>
              </div>
            )}

            {apt.cancelReason && (
              <div className="p-2.5 rounded bg-red-50 text-red-800 border border-red-200 text-xs space-y-1 mt-2 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
                <span className="font-semibold">Cancellation Reason:</span>
                <p>{apt.cancelReason}</p>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {apt.status === "PENDING" && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await confirmAppointment(apt.id)
                      toast.success("Appointment confirmed")
                      onOpenChange(false)
                    } catch {
                      toast.error("Could not confirm")
                    }
                  })
                }
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Appointment
              </Button>
            )}

            {["PENDING", "CONFIRMED", "SCHEDULED"].includes(apt.status) && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await checkInAppointment(apt.id)
                      toast.success("Patient marked as Arrived")
                      onOpenChange(false)
                    } catch {
                      toast.error("Could not check in")
                    }
                  })
                }
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Arrived
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link href={`/patients/${apt.patientId}/encounters/new?appointmentId=${apt.id}`}>
                  <Stethoscope className="h-4 w-4 mr-1.5" />
                  EMR Consultation
                </Link>
              }
            />

            {["PENDING", "CONFIRMED", "SCHEDULED", "ARRIVED"].includes(apt.status) && (
              <Button size="sm" variant="outline" onClick={onRescheduleClick}>
                Reschedule
              </Button>
            )}

            {["PENDING", "CONFIRMED", "SCHEDULED", "ARRIVED"].includes(apt.status) && (
              <Button size="sm" variant="destructive" onClick={onCancelClick}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({
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
              placeholder="e.g. Patient requested cancellation / Rescheduled via phone"
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

function RescheduleDialog({
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
