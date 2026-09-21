"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { checkIn, checkOut, requestLeave, decideLeaveRequest, type getMyAttendance, type getMyLeaveRequests, type getAllLeaveRequests, type getStaffAttendanceForDate } from "@/actions/attendance"
import { formatDate, formatTime } from "@/lib/format"

type MyAttendance = Awaited<ReturnType<typeof getMyAttendance>>
type MyLeaveRequests = Awaited<ReturnType<typeof getMyLeaveRequests>>
type AllLeaveRequests = Awaited<ReturnType<typeof getAllLeaveRequests>>
type TodayOverview = Awaited<ReturnType<typeof getStaffAttendanceForDate>>

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
}

export function AttendanceView({
  isAdmin,
  myAttendance,
  myLeaveRequests,
  allLeaveRequests,
  todayOverview,
}: {
  isAdmin: boolean
  myAttendance: MyAttendance
  myLeaveRequests: MyLeaveRequests
  allLeaveRequests: AllLeaveRequests
  todayOverview: TodayOverview
}) {
  const [pending, startTransition] = useTransition()
  const [leaveOpen, setLeaveOpen] = useState(false)
  const router = useRouter()

  const todayRecord = myAttendance.find((a) => formatDate(a.date) === formatDate(new Date()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <div className="flex gap-2">
          <Button
            disabled={pending || !!todayRecord?.checkInAt}
            onClick={() =>
              startTransition(async () => {
                try {
                  await checkIn()
                  toast.success("Checked in")
                  router.refresh()
                } catch {
                  toast.error("Could not check in")
                }
              })
            }
          >
            Check In
          </Button>
          <Button
            variant="outline"
            disabled={pending || !todayRecord?.checkInAt || !!todayRecord?.checkOutAt}
            onClick={() =>
              startTransition(async () => {
                try {
                  await checkOut()
                  toast.success("Checked out")
                  router.refresh()
                } catch {
                  toast.error("Could not check out")
                }
              })
            }
          >
            Check Out
          </Button>
          <Button variant="outline" onClick={() => setLeaveOpen(true)}>Request Leave</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Attendance (This Month)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {myAttendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet.</p>
          ) : (
            myAttendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span>{formatDate(a.date)}</span>
                <span className="text-muted-foreground">
                  {a.checkInAt ? formatTime(a.checkInAt) : "—"} - {a.checkOutAt ? formatTime(a.checkOutAt) : "—"}
                </span>
                <Badge variant="outline">{a.status.replace("_", " ")}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {myLeaveRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests yet.</p>
          ) : (
            myLeaveRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span>{formatDate(r.startDate)} - {formatDate(r.endDate)} · {r.reason}</span>
                <Badge variant={statusVariant[r.status] ?? "outline"}>{r.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Staff Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayOverview.map((row) => (
                <div key={row.user.id} className="flex items-center justify-between text-sm">
                  <span>{row.user.name} <span className="text-muted-foreground">({row.user.role})</span></span>
                  {row.attendance ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {row.attendance.checkInAt ? formatTime(row.attendance.checkInAt) : "—"} - {row.attendance.checkOutAt ? formatTime(row.attendance.checkOutAt) : "—"}
                      </span>
                      <Badge variant="outline">{row.attendance.status.replace("_", " ")}</Badge>
                    </div>
                  ) : (
                    <Badge variant="destructive">Not checked in</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Requests to Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {allLeaveRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave requests.</p>
              ) : (
                allLeaveRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>
                      {r.user.name} ({r.user.role}) · {formatDate(r.startDate)} - {formatDate(r.endDate)} · {r.reason}
                    </span>
                    {r.status === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await decideLeaveRequest(r.id, true)
                                router.refresh()
                              } catch {
                                toast.error("Could not approve")
                              }
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await decideLeaveRequest(r.id, false)
                                router.refresh()
                              } catch {
                                toast.error("Could not reject")
                              }
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Badge variant={statusVariant[r.status] ?? "outline"}>{r.status}</Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      <RequestLeaveDialog open={leaveOpen} onOpenChange={setLeaveOpen} />
    </div>
  )
}

function RequestLeaveDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family function" />
          </div>
          <Button
            className="w-full"
            disabled={pending || !startDate || !endDate || !reason}
            onClick={() =>
              startTransition(async () => {
                try {
                  await requestLeave({ startDate, endDate, reason })
                  toast.success("Leave request submitted")
                  onOpenChange(false)
                  setStartDate("")
                  setEndDate("")
                  setReason("")
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not submit request")
                }
              })
            }
          >
            {pending ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
