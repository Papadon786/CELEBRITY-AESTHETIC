"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Clock,
  UserCheck,
  Stethoscope,
  CheckCircle2,
  CalendarClock,
  RotateCw,
  Search,
  Users,
  FileText,
  Pill,
  UserX,
  Hash,
  Phone,
  Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { initials, patientDisplayName, formatRelative, formatTime } from "@/lib/format"
import { appointmentTypeLabels } from "@/lib/labels"
import {
  startConsultation,
  completeConsultation,
  markNoShow,
  checkInAppointment,
  type getTodayQueue,
} from "@/actions/appointments"
import { cn } from "@/lib/utils"

type Queue = Awaited<ReturnType<typeof getTodayQueue>>
type QueueEntry = Queue[number]
type Doctor = { id: string; name: string; specialization: string | null }

type StatusFilter = "ALL" | "WAITING" | "IN_PROGRESS" | "SCHEDULED" | "COMPLETED"

export function QueueBoard({ queue, doctors }: { queue: Queue; doctors: Doctor[] }) {
  const router = useRouter()
  const [doctorFilter, setDoctorFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh queue every 30 seconds for live board
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, 30000)
    return () => clearInterval(timer)
  }, [router])

  function handleManualRefresh() {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Queue refreshed")
    }, 600)
  }

  // Calculate high-level counters across all today's appointments
  const stats = useMemo(() => {
    let waiting = 0
    let inProgress = 0
    let scheduled = 0
    let completed = 0

    for (const q of queue) {
      if (q.status === "ARRIVED") waiting++
      else if (q.status === "IN_CONSULTATION") inProgress++
      else if (q.status === "COMPLETED") completed++
      else if (q.status === "PENDING" || q.status === "CONFIRMED") scheduled++
    }

    return {
      total: queue.length,
      waiting,
      inProgress,
      scheduled,
      completed,
    }
  }, [queue])

  // Filter queue by doctor, status, and search query
  const filtered = useMemo(() => {
    return queue.filter((item) => {
      // Doctor filter
      if (doctorFilter !== "ALL" && item.doctorId !== doctorFilter) return false

      // Status tab filter
      if (statusFilter === "WAITING" && item.status !== "ARRIVED") return false
      if (statusFilter === "IN_PROGRESS" && item.status !== "IN_CONSULTATION") return false
      if (statusFilter === "SCHEDULED" && item.status !== "PENDING" && item.status !== "CONFIRMED") return false
      if (statusFilter === "COMPLETED" && item.status !== "COMPLETED") return false

      // Search query (patient name, uhid, phone, token code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const name = patientDisplayName(item.patient).toLowerCase()
        const uhid = (item.patient.uhid || "").toLowerCase()
        const phone = (item.patient.phone || "").toLowerCase()
        const code = (item.appointmentCode || "").toLowerCase()

        if (!name.includes(q) && !uhid.includes(q) && !phone.includes(q) && !code.includes(q)) {
          return false
        }
      }

      return true
    })
  }, [queue, doctorFilter, statusFilter, searchQuery])

  // Group filtered results by doctor
  const grouped = useMemo(() => {
    const map = new Map<string, Queue>()
    for (const entry of filtered) {
      const key = entry.doctorId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(entry)
    }
    return map
  }, [filtered])

  const doctorOptions = Object.fromEntries(doctors.map((d) => [d.id, `Dr. ${d.name}`]))

  return (
    <div className="space-y-5">
      {/* Real-time Queue Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter("WAITING")}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-sm",
            statusFilter === "WAITING" && "ring-2 ring-amber-500 border-amber-500 bg-amber-500/5"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Waiting (Arrived)</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{stats.waiting}</p>
        </div>

        <div
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-sm",
            statusFilter === "IN_PROGRESS" && "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In Consultation</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Stethoscope className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.inProgress}</p>
        </div>

        <div
          onClick={() => setStatusFilter("SCHEDULED")}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-sm",
            statusFilter === "SCHEDULED" && "ring-2 ring-blue-500 border-blue-500 bg-blue-500/5"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Upcoming Today</span>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.scheduled}</p>
        </div>

        <div
          onClick={() => setStatusFilter("COMPLETED")}
          className={cn(
            "p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:border-violet-500/50 hover:shadow-sm",
            statusFilter === "COMPLETED" && "ring-2 ring-violet-500 border-violet-500 bg-violet-500/5"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed Today</span>
            <CheckCircle2 className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{stats.completed}</p>
        </div>
      </div>

      {/* Control Bar: Search, Doctor Filter, Status Filter, Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Patient Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by name, UHID, token…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Doctor Filter */}
          <div className="w-full sm:w-56">
            <Select
              items={{ ALL: "All Doctors", ...doctorOptions }}
              value={doctorFilter}
              onValueChange={(val) => setDoctorFilter(val ?? "ALL")}
            >
              <SelectTrigger className="w-full h-9 text-xs sm:text-sm">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Doctors ({doctors.length})</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    Dr. {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Status Tabs Pill */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                statusFilter === "ALL" && "bg-background text-foreground shadow-xs font-semibold"
              )}
            >
              All ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("WAITING")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                statusFilter === "WAITING" && "bg-background text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
              )}
            >
              Waiting ({stats.waiting})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                statusFilter === "IN_PROGRESS" && "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
              )}
            >
              Active ({stats.inProgress})
            </button>
          </div>

          {/* Manual Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="h-9 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
            title="Refresh queue now"
          >
            <RotateCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Queue Cards or Empty State */}
      {grouped.size === 0 ? (
        <Card className="border-dashed bg-card/60">
          <CardContent className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/80 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No patients in this queue view</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1 mb-4">
              {searchQuery || doctorFilter !== "ALL" || statusFilter !== "ALL"
                ? "No patients match the active filters. Try resetting the filters or search query."
                : "No patients currently waiting or in consultation. Scheduled patients will appear here when they check in, or you can register a new walk-in."}
            </p>
            <div className="flex items-center gap-2">
              {(searchQuery || doctorFilter !== "ALL" || statusFilter !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setDoctorFilter("ALL")
                    setStatusFilter("ALL")
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[...grouped.entries()].map(([doctorId, entries]) => {
            const doctor = entries[0].doctor
            const waitingCount = entries.filter((e) => e.status === "ARRIVED").length
            const activeCount = entries.filter((e) => e.status === "IN_CONSULTATION").length

            return (
              <Card key={doctorId} className="overflow-hidden shadow-xs border">
                <CardHeader className="py-3 px-4 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {initials(doctor.name)}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold truncate">Dr. {doctor.name}</CardTitle>
                      {doctor.specialization && (
                        <p className="text-[11px] text-muted-foreground truncate">{doctor.specialization}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeCount > 0 && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        {activeCount} with doctor
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {waitingCount} waiting
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-2.5">
                  {entries.map((entry) => (
                    <QueueRow key={entry.id} entry={entry} />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function QueueRow({ entry }: { entry: QueueEntry }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const isInProgress = entry.status === "IN_CONSULTATION"
  const isArrived = entry.status === "ARRIVED"
  const isScheduled = entry.status === "PENDING" || entry.status === "CONFIRMED"
  const isCompleted = entry.status === "COMPLETED"

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3 transition-colors bg-card",
        isInProgress && "border-emerald-500/40 bg-emerald-500/5",
        isArrived && "border-amber-500/30 bg-amber-500/5",
        isCompleted && "opacity-75 bg-muted/20"
      )}
    >
      {/* Token & Patient Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Token code pill */}
        <div className="flex flex-col items-center justify-center px-2 py-1 rounded-md bg-muted border shrink-0 text-center min-w-[54px]">
          <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Token</span>
          <span className="text-xs font-mono font-bold text-foreground">
            {entry.appointmentCode || `#${entry.id.slice(-4)}`}
          </span>
        </div>

        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
            {initials(patientDisplayName(entry.patient))}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/patients/${entry.patientId}`}
              className="text-sm font-semibold hover:underline truncate text-foreground"
            >
              {patientDisplayName(entry.patient)}
            </Link>

            {/* Status Badge */}
            {isInProgress && (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                In Progress
              </Badge>
            )}
            {isArrived && (
              <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 text-[10px] px-1.5 py-0">
                Waiting
              </Badge>
            )}
            {isScheduled && (
              <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 text-[10px] px-1.5 py-0">
                Scheduled
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Done
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
            <span className="flex items-center gap-0.5">
              <Hash className="h-3 w-3" />
              {entry.patient.uhid}
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Phone className="h-3 w-3" />
              {entry.patient.phone}
            </span>
            {entry.service && (
              <>
                <span>·</span>
                <span className="truncate text-foreground/80 font-medium">{entry.service.name}</span>
              </>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground mt-0.5">
            {appointmentTypeLabels[entry.type] || entry.type} ·{" "}
            {isArrived && entry.checkedInAt
              ? `Checked in ${formatRelative(entry.checkedInAt)}`
              : isInProgress && entry.startedAt
              ? `Consult started ${formatRelative(entry.startedAt)}`
              : isCompleted && entry.completedAt
              ? `Completed ${formatRelative(entry.completedAt)}`
              : `Scheduled for ${formatTime(entry.scheduledAt)}`}
            {entry.reason ? ` · "${entry.reason}"` : ""}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0">
        {/* If scheduled but not checked in yet: receptionist can Check In */}
        {isScheduled && (
          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await checkInAppointment(entry.id)
                  toast.success(`${entry.appointmentCode} checked in to waiting room`)
                  router.refresh()
                } catch {
                  toast.error("Could not check in patient")
                }
              })
            }
          >
            <UserCheck className="h-3.5 w-3.5" />
            Check In
          </Button>
        )}

        {/* If arrived/waiting: can Start Consultation directly */}
        {isArrived && (
          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await startConsultation(entry.id)
                  toast.success("Consultation started")
                  router.refresh()
                } catch {
                  toast.error("Could not start consultation")
                }
              })
            }
          >
            Start
          </Button>
        )}

        {/* EMR Chart shortcut for active/completed visits */}
        {(isInProgress || isCompleted) && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1"
            nativeButton={false}
            render={
              <Link href={`/patients/${entry.patientId}/encounters/new?appointmentId=${entry.id}`}>
                <FileText className="h-3 w-3" />
                EMR Chart
              </Link>
            }
          />
        )}

        {/* Prescription shortcut */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1"
          nativeButton={false}
          render={
            <Link href={`/prescriptions/new?patientId=${entry.patientId}&appointmentId=${entry.id}`}>
              <Pill className="h-3 w-3" />
              Rx
            </Link>
          }
        />

        {/* Complete consultation button */}
        {isInProgress && (
          <Button
            size="sm"
            variant="default"
            className="h-8 text-xs font-medium"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await completeConsultation(entry.id)
                  toast.success("Consultation marked as completed")
                  router.refresh()
                } catch {
                  toast.error("Could not complete consultation")
                }
              })
            }
          >
            Complete
          </Button>
        )}

        {/* No-show option for non-completed entries */}
        {!isCompleted && !isInProgress && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await markNoShow(entry.id)
                  toast.info("Marked as No-show")
                  router.refresh()
                } catch {
                  toast.error("Could not update status")
                }
              })
            }
          >
            <UserX className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">No-show</span>
          </Button>
        )}
      </div>
    </div>
  )
}
