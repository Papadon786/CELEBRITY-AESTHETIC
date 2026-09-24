"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserPlus, Loader2, Stethoscope } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PatientPicker } from "@/components/appointments/patient-picker"
import { createWalkIn } from "@/actions/appointments"

type Doctor = { id: string; name: string; specialization: string | null }

export function WalkInDialog({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "")
  const [pending, startTransition] = useTransition()

  const formatDoc = (d: Doctor) =>
    `${d.name.startsWith("Dr.") ? d.name : `Dr. ${d.name}`}${d.specialization ? ` · ${d.specialization}` : ""}`

  const doctorOptions = Object.fromEntries(doctors.map((d) => [d.id, formatDoc(d)]))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 font-medium shadow-sm">
            <UserPlus className="h-4 w-4" />
            <span>New Walk-in</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserPlus className="h-4 w-4" />
            </div>
            <span>Register Walk-in Patient</span>
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4 pt-1"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            if (!patientId) {
              toast.error("Please select a patient")
              return
            }
            const chosenDoctor = doctorId || doctors[0]?.id
            if (!chosenDoctor) {
              toast.error("Please select a consulting doctor")
              return
            }

            startTransition(async () => {
              try {
                const apt = await createWalkIn({
                  patientId,
                  doctorId: chosenDoctor,
                  reason: String(fd.get("reason") || "") || undefined,
                })
                toast.success(`${apt.appointmentCode} added to today's queue`)
                setOpen(false)
                setPatientId("")
                router.refresh()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not register walk-in")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Patient *</Label>
            <PatientPicker value={patientId} onChange={setPatientId} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Consulting Doctor *</span>
            </Label>
            {doctors.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No active doctors registered in system.</p>
            ) : (
              <Select
                items={doctorOptions}
                value={doctorId || doctors[0]?.id}
                onValueChange={(value) => setDoctorId(value ?? "")}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select consulting doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span className="truncate">{formatDoc(d)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wi-reason" className="text-xs font-semibold">
              Reason for Visit (Optional)
            </Label>
            <Textarea
              id="wi-reason"
              name="reason"
              placeholder="e.g. Skin consultation, routine follow-up, hair review, acne treatment…"
              className="text-xs sm:text-sm min-h-20 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setPatientId("")
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !patientId} className="flex-1 font-medium gap-2">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Issuing token…</span>
                </>
              ) : (
                <span>Check In Now</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
