"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UserPlus, Stethoscope, Shield, UserCheck, Receipt, Eye, EyeOff, HeartPulse, Syringe, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { createStaffMember } from "@/actions/staff"
import type { StaffRole } from "@/types/database"

const roleOptions: { value: StaffRole; label: string; icon: typeof UserCheck; desc: string }[] = [
  { value: "RECEPTIONIST", label: "Receptionist (Staff)", icon: UserCheck, desc: "Selective access: Book appointments, check-in tokens, medicine dispensing/returns, payments" },
  { value: "DOCTOR", label: "Doctor", icon: Stethoscope, desc: "Consultations, EMR, Prescriptions & Signature" },
  { value: "NURSE", label: "Nurse", icon: HeartPulse, desc: "Patient care, queue, medicine dispensing — no prescribing" },
  { value: "TECHNICIAN", label: "Technician", icon: Syringe, desc: "Laser/FUE/PMU procedures, queue, medicine dispensing — no prescribing" },
  { value: "SALES", label: "Sales", icon: TrendingUp, desc: "Leads, prospects, clients, and patient communications" },
  { value: "BILLING", label: "Billing", icon: Receipt, desc: "Payments, invoices, refunds requests, and financial reports" },
  { value: "ADMIN", label: "Clinic Administrator", icon: Shield, desc: "Full CRM control, appointment editing, medicine catalog, staff management, audit logs" },
]

export function AddStaffDialog() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<StaffRole>("RECEPTIONIST")
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const name = String(fd.get("name") || "").trim()
    const email = String(fd.get("email") || "").trim()
    const phone = String(fd.get("phone") || "").trim()
    const password = String(fd.get("password") || "")
    const specialization = String(fd.get("specialization") || "").trim()
    const consultationFee = Number(fd.get("consultationFee")) || undefined

    if (!name || !email || !password) {
      toast.error("Please fill in name, email, and password")
      return
    }

    startTransition(async () => {
      try {
        await createStaffMember({
          name,
          email,
          phone: phone || undefined,
          password,
          role,
          specialization: role === "DOCTOR" ? specialization : undefined,
          consultationFee: role === "DOCTOR" ? consultationFee : undefined,
        })
        toast.success(`Staff account created for ${name}`)
        setOpen(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to create staff account")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5 font-medium shadow-xs">
            <UserPlus className="h-4 w-4" />
            <span>New Staff Login</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create Staff Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" htmlFor="staff-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input id="staff-name" name="name" placeholder="e.g. Dr. Sarah Jenkins" required />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium" htmlFor="staff-email">
                Email Address (Login ID) <span className="text-destructive">*</span>
              </Label>
              <Input id="staff-email" name="email" type="email" placeholder="staff@celebrityaesthetic.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" htmlFor="staff-phone">Phone Number</Label>
              <Input id="staff-phone" name="phone" placeholder="9876543210" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium" htmlFor="staff-password">
                Temporary Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="staff-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Staff Role & Access Level</Label>
            <Select
              items={Object.fromEntries(roleOptions.map((r) => [r.value, r.label]))}
              value={role}
              onValueChange={(val) => val && setRole(val as StaffRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => {
                  const Icon = r.icon
                  return (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex items-center gap-2 py-0.5">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{r.label}</p>
                          <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor-Specific Options */}
          {role === "DOCTOR" && (
            <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" /> Doctor Profile Details
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" htmlFor="staff-specialization">Specialization / Department</Label>
                <Input id="staff-specialization" name="specialization" placeholder="e.g. Dermatologist, Trichologist" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" htmlFor="staff-fee">Standard Consultation Fee (₹)</Label>
                <Input id="staff-fee" name="consultationFee" type="number" placeholder="500" defaultValue="500" />
              </div>
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full h-10 font-medium">
            {pending ? "Creating Account…" : "Create Staff Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
