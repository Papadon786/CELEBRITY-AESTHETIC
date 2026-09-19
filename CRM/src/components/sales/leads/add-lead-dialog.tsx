"use client"

import { useState, useTransition } from "react"
import { Plus, UserPlus, Sparkles, IndianRupee } from "lucide-react"
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
import { createLead } from "@/actions/leads"

interface StaffOption {
  id: string
  name: string
  role: string
}

export function AddLeadDialog({
  staff,
  trigger,
}: {
  staff: StaffOption[]
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "NEW",
    source: "WEBSITE",
    value: "",
    icpScore: 5,
    assignedToId: "",
    followUpDays: "2",
    notes: "",
  })

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Lead name is required")
      return
    }

    startTransition(async () => {
      try {
        let followUpDate: string | null = null
        if (formData.followUpDays) {
          const d = new Date()
          d.setDate(d.getDate() + parseInt(formData.followUpDays, 10))
          followUpDate = d.toISOString()
        }

        await createLead({
          name: formData.name.trim(),
          company: formData.company.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          status: formData.status as any,
          source: formData.source as any,
          value: formData.value ? parseFloat(formData.value) : null,
          icpScore: Number(formData.icpScore),
          assignedToId: formData.assignedToId || null,
          followUpDate,
          notes: formData.notes.trim() || null,
        })

        toast.success(`Lead "${formData.name}" added successfully`)
        setOpen(false)
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          status: "NEW",
          source: "WEBSITE",
          value: "",
          icpScore: 5,
          assignedToId: "",
          followUpDays: "2",
          notes: "",
        })
      } catch (err: any) {
        toast.error(err?.message || "Failed to create lead")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) || (
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add New Sales Lead</DialogTitle>
              <DialogDescription className="text-xs">
                Capture high-intent prospect information, assign sales rep, and set follow-up.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Lead / Contact Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Company / Organization</Label>
              <Input
                placeholder="e.g. Acme Wellness / Self"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
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
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pipeline Stage</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => handleChange("status", val || "NEW")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="DEMO">Demo / Consult</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal Sent</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="WON">Won (Converted)</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Lead Source</Label>
              <Select
                value={formData.source}
                onValueChange={(val) => handleChange("source", val || "WEBSITE")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Website / Form</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="GOOGLE">Google Ads / Search</SelectItem>
                  <SelectItem value="REFERRAL">Referral</SelectItem>
                  <SelectItem value="WALK_IN">Walk-in Inquiry</SelectItem>
                  <SelectItem value="PHONE">Phone Call</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Deal Value (₹)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="25000"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  className="pl-7"
                />
                <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">₹</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign Sales Rep</Label>
              <Select
                value={formData.assignedToId}
                onValueChange={(val) => handleChange("assignedToId", val || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Follow-up In</Label>
              <Select
                value={formData.followUpDays}
                onValueChange={(val) => handleChange("followUpDays", val || "2")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Follow-up" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Today</SelectItem>
                  <SelectItem value="1">Tomorrow (1 day)</SelectItem>
                  <SelectItem value="2">In 2 days</SelectItem>
                  <SelectItem value="3">In 3 days</SelectItem>
                  <SelectItem value="7">In 1 week</SelectItem>
                  <SelectItem value="14">In 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">ICP Score</Label>
                <span className="text-xs font-bold text-primary">{formData.icpScore}/10</span>
              </div>
              <Select
                value={String(formData.icpScore)}
                onValueChange={(val) => handleChange("icpScore", val ? parseInt(val, 10) : 5)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ICP Fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0/10 (Disqualify)</SelectItem>
                  <SelectItem value="3">3/10 (Low Fit)</SelectItem>
                  <SelectItem value="5">5/10 (Moderate)</SelectItem>
                  <SelectItem value="8">8/10 (High Fit)</SelectItem>
                  <SelectItem value="10">10/10 (Ideal ICP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notes & Treatment Interests</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Inquired about HydraFacial & laser treatment package. Prefers weekend slots."
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Save Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
