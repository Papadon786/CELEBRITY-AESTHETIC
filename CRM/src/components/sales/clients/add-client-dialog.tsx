"use client"

import { useState, useTransition } from "react"
import { Plus, Briefcase, IndianRupee, UserCheck, Sparkles, Stethoscope, Crown } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/actions/clients"
import type { ClientStatus, RenewalStage } from "@/types/database"

interface StaffOption {
  id: string
  name: string
  role: string
}

const MEMBERSHIP_TIERS = [
  "Celebrity Black VIP Skin Passport",
  "Annual Hair Rejuvenation Retainer",
  "Annual Medi-Facial & Glow Club",
  "Bridal Elite Aesthetic Concierge",
  "Quarterly Trichology Booster Pass",
  "Corporate Executive Skin Wellness",
]

const TREATMENT_FOCUS_OPTIONS = [
  "Trichology (Hair Restoration & PRP)",
  "Cosmetology (Advanced Skin & Peels)",
  "Laser & Medi-Facials (HydraFacial)",
  "Anti-Aging & Injectables (Botox/Fillers)",
  "Holistic Aesthetic Transformation",
]

export function AddClientDialog({
  staff,
  trigger,
}: {
  staff?: StaffOption[]
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: "",
    membershipTier: "Celebrity Black VIP Skin Passport",
    treatmentFocus: "Trichology (Hair Restoration & PRP)",
    company: "Celebrity Black VIP Skin Passport",
    email: "",
    phone: "",
    status: "ACTIVE" as ClientStatus,
    healthScore: 50,
    accountManagerName: "Dr. Naziya Baig",
    accountManagerId: "",
    contractValue: "45000",
    boosterFrequency: "Quarterly",
    renewalMonths: "12",
    renewalStage: "NOT_STARTED" as RenewalStage,
    notes: "",
  })

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleMembershipChange(tier: string) {
    let val = "45000"
    let focus = "Cosmetology (Advanced Skin & Peels)"
    let doctor = "Dr. Naziya Baig"

    if (tier.includes("Hair") || tier.includes("Trichology")) {
      val = "60000"
      focus = "Trichology (Hair Restoration & PRP)"
      doctor = "Reehal Baig"
    } else if (tier.includes("Celebrity Black")) {
      val = "120000"
      focus = "Holistic Aesthetic Transformation"
      doctor = "Dr. Naziya Baig"
    } else if (tier.includes("Bridal")) {
      val = "75000"
      focus = "Holistic Aesthetic Transformation"
      doctor = "Dr. Naziya Baig"
    }

    setFormData((prev) => ({
      ...prev,
      membershipTier: tier,
      company: tier,
      contractValue: val,
      treatmentFocus: focus,
      accountManagerName: doctor,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Client name is required")
      return
    }

    startTransition(async () => {
      try {
        let renewalDate: string | null = null
        if (formData.renewalMonths) {
          const d = new Date()
          d.setMonth(d.getMonth() + parseInt(formData.renewalMonths, 10))
          renewalDate = d.toISOString()
        }

        const res = await createClient({
          name: formData.name.trim(),
          company: formData.company.trim() || formData.membershipTier,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          status: formData.status,
          healthScore: Number(formData.healthScore),
          accountManagerName: formData.accountManagerName.trim() || null,
          accountManagerId: formData.accountManagerId || null,
          contractValue: parseFloat(formData.contractValue) || 0,
          renewalDate,
          renewalStage: formData.renewalStage,
          membershipTier: formData.membershipTier,
          treatmentFocus: formData.treatmentFocus,
          boosterFrequency: formData.boosterFrequency,
          notes: formData.notes.trim() || null,
        })

        if (res.success) {
          toast.success(`VIP Client "${formData.name}" onboarded successfully`)
          setOpen(false)
          setFormData({
            name: "",
            membershipTier: "Celebrity Black VIP Skin Passport",
            treatmentFocus: "Trichology (Hair Restoration & PRP)",
            company: "Celebrity Black VIP Skin Passport",
            email: "",
            phone: "",
            status: "ACTIVE",
            healthScore: 50,
            accountManagerName: "Dr. Naziya Baig",
            accountManagerId: "",
            contractValue: "45000",
            boosterFrequency: "Quarterly",
            renewalMonths: "12",
            renewalStage: "NOT_STARTED",
            notes: "",
          })
        } else {
          toast.error(res.error || "Failed to create client")
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) || (
            <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Add Client Retainer</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Onboard VIP Aesthetic Client</DialogTitle>
              <DialogDescription className="text-xs">
                Register a VIP membership, annual hair/skin retainer, or corporate wellness partner.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Client / VIP Member Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Dr Naaziya"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">VIP Membership Tier</Label>
              <Select
                value={formData.membershipTier}
                onValueChange={(val) => handleMembershipChange(val || MEMBERSHIP_TIERS[0])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical Treatment Focus</Label>
              <Select
                value={formData.treatmentFocus}
                onValueChange={(val) => handleChange("treatmentFocus", val || TREATMENT_FOCUS_OPTIONS[0])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Treatment Focus" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_FOCUS_OPTIONS.map((foc) => (
                    <SelectItem key={foc} value={foc}>
                      {foc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Aesthetic Coordinator / Doctor</Label>
              <Select
                value={formData.accountManagerName}
                onValueChange={(val) => handleChange("accountManagerName", val || "Dr. Naziya Baig")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Doctor / Coordinator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Naziya Baig">Dr. Naziya Baig (Cosmetologist)</SelectItem>
                  <SelectItem value="Reehal Baig">Reehal Baig (Trichologist)</SelectItem>
                  <SelectItem value="Bhumika R">Bhumika R (Lead Coordinator)</SelectItem>
                  <SelectItem value="Touhid Ahmed">Touhid Ahmed (VIP Concierge)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Annual Retainer Value (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="45,000"
                  className="pl-9 font-mono"
                  value={formData.contractValue}
                  onChange={(e) => handleChange("contractValue", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Booster Frequency</Label>
              <Select
                value={formData.boosterFrequency}
                onValueChange={(val) => handleChange("boosterFrequency", val || "Quarterly")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Bi-Monthly">Bi-Monthly (Every 2 mo)</SelectItem>
                  <SelectItem value="Quarterly">Quarterly (Every 3 mo)</SelectItem>
                  <SelectItem value="Bi-Annual">Bi-Annual (Every 6 mo)</SelectItem>
                  <SelectItem value="Annual">Annual Touch-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Initial Health Score</Label>
              <Select
                value={String(formData.healthScore)}
                onValueChange={(val) => handleChange("healthScore", val ? parseInt(val, 10) : 50)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Health" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 (Needs Follow-up)</SelectItem>
                  <SelectItem value="50">50 (Active Standard)</SelectItem>
                  <SelectItem value="75">75 (Consistent Sessions)</SelectItem>
                  <SelectItem value="90">90 (Flawless Protocol)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Membership Terms & Protocol Schedule</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Includes 4 quarterly GFC booster sessions + 2 complimentary HydraFacial Deluxe treatments."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              {isPending ? "Onboarding..." : "Onboard VIP Retainer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
