"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"
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
  const [open, setOpen] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "")
  const [pending, startTransition] = useTransition()

  const formatDoc = (d: Doctor) =>
    `${d.name.startsWith("Dr.") ? d.name : `Dr. ${d.name}`}${d.specialization ? ` · ${d.specialization}` : ""}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5 font-medium">
            <UserPlus className="h-4 w-4" />
            New Walk-in
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Register Walk-in Patient
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3.5 pt-1"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            if (!patientId) {
              toast.error("Please select a patient")
              return
            }
            startTransition(async () => {
              try {
                const apt = await createWalkIn({
                  patientId,
                  doctorId,
                  reason: String(fd.get("reason") || "") || undefined,
                })
                toast.success(`${apt.appointmentCode} added to today's queue`)
                setOpen(false)
                setPatientId("")
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not register walk-in")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Patient</Label>
            <PatientPicker value={patientId} onChange={setPatientId} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Consulting Doctor</Label>
            <Select
              items={Object.fromEntries(doctors.map((d) => [d.id, formatDoc(d)]))}
              value={doctorId}
              onValueChange={(value) => setDoctorId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {formatDoc(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wi-reason" className="text-xs font-medium">Reason for Visit (Optional)</Label>
            <Textarea
              id="wi-reason"
              name="reason"
              placeholder="e.g. Skin consultation, routine follow-up, hair review…"
              className="text-xs sm:text-sm min-h-20"
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full h-10 font-medium">
            {pending ? "Issuing token…" : "Check In Now"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
