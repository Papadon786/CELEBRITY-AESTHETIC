"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Stethoscope } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateStaffMember } from "@/actions/staff"
import type { StaffRole } from "@/types/database"

type StaffMember = {
  id: string
  name: string
  email: string
  phone: string | null
  role: StaffRole
  specialization: string | null
  consultationFee: number | null
  active: boolean
}

export function EditStaffDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: StaffMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [role, setRole] = useState<StaffRole>(staff?.role ?? "RECEPTIONIST")
  const [pending, startTransition] = useTransition()

  if (!staff) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!staff) return

    const fd = new FormData(e.currentTarget)
    const name = String(fd.get("name") || "").trim()
    const phone = String(fd.get("phone") || "").trim()
    const specialization = String(fd.get("specialization") || "").trim()
    const consultationFee = Number(fd.get("consultationFee")) || undefined

    if (!name) {
      toast.error("Name is required")
      return
    }

    startTransition(async () => {
      try {
        await updateStaffMember(staff.id, {
          name,
          phone: phone || undefined,
          role,
          specialization: role === "DOCTOR" ? specialization : undefined,
          consultationFee: role === "DOCTOR" ? consultationFee : undefined,
        })
        toast.success(`Updated staff details for ${name}`)
        onOpenChange(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to update staff")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Staff Member ({staff.name})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" htmlFor="edit-staff-name">Full Name</Label>
            <Input id="edit-staff-name" name="name" defaultValue={staff.name} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email (Login ID)</Label>
              <Input value={staff.email} disabled className="bg-muted text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium" htmlFor="edit-staff-phone">Phone Number</Label>
              <Input id="edit-staff-phone" name="phone" defaultValue={staff.phone ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Role & Access</Label>
            <Select
              items={{
                RECEPTIONIST: "Receptionist (Staff)",
                DOCTOR: "Doctor",
                ADMIN: "Clinic Administrator",
              }}
              value={role}
              onValueChange={(val) => val && setRole(val as StaffRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEPTIONIST">Receptionist (Staff)</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="ADMIN">Clinic Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "DOCTOR" && (
            <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" /> Doctor Details
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" htmlFor="edit-specialization">Specialization</Label>
                <Input id="edit-specialization" name="specialization" defaultValue={staff.specialization ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" htmlFor="edit-fee">Consultation Fee (₹)</Label>
                <Input id="edit-fee" name="consultationFee" type="number" defaultValue={staff.consultationFee ?? 500} />
              </div>
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full h-10 font-medium">
            {pending ? "Saving Changes…" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
