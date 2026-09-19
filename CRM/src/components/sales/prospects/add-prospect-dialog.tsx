"use client"

import { useState, useTransition } from "react"
import { Plus, Sparkles, Stethoscope, UserPlus, IndianRupee } from "lucide-react"
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
import { createProspect } from "@/actions/prospects"
import type { ProspectStage } from "@/types/database"

interface StaffOption {
  id: string
  name: string
  role: string
}

const TREATMENT_CATEGORIES = [
  { id: "HAIR_TRANSPLANT", label: "Hair Transplant (FUE, Bio-FUE, 22 Specialities)" },
  { id: "HAIR_RESTORATION", label: "Hair Restoration (GFC, PRP, Exosomes)" },
  { id: "SKIN_AESTHETICS", label: "Skin Care & Medi-Facials (HydraFacial, Carbon Peel)" },
  { id: "ACNE_SCARS", label: "Acne Scars (MNRF, Subcision, CO2 Fractional)" },
  { id: "ANTI_AGING", label: "Anti-Aging & Injectables (Botox, Fillers, Threads)" },
  { id: "BRIDAL", label: "Pre-Bridal Aesthetic Transformation Packages" },
  { id: "PMU", label: "Permanent Makeup (PMU & Scalp SMP)" },
]

export function AddProspectDialog({
  staff,
  trigger,
  defaultStage = "QUALIFIED",
}: {
  staff?: StaffOption[]
  trigger?: React.ReactNode
  defaultStage?: ProspectStage
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: "",
    treatmentCategory: "HAIR_TRANSPLANT",
    treatmentInterest: "FUE Hair Transplant (3,000 Grafts)",
    candidateConcern: "Norwood Stage 3 hair loss, receding temples",
    doctorPreference: "Hair Transplant Team (Satyam Centre)",
    email: "",
    phone: "",
    stage: defaultStage,
    value: "75000",
    icpScore: 9,
    engagement: 35,
    dueDays: "3",
    assignedToId: "",
    notes: "",
  })

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleCategoryChange(cat: string) {
    let defaultInterest = "Custom Aesthetic Plan"
    let defaultVal = "25000"
    let defaultDoctor = "Dr. Naziya Baig"

    if (cat === "HAIR_TRANSPLANT") {
      defaultInterest = "FUE Hair Transplant (3,000 Grafts)"
      defaultVal = "85000"
      defaultDoctor = "Hair Transplant Team (Satyam Centre)"
    } else if (cat === "HAIR_RESTORATION") {
      defaultInterest = "Advanced GFC Protocol (4 Sessions)"
      defaultVal = "32000"
      defaultDoctor = "Reehal Baig"
    } else if (cat === "SKIN_AESTHETICS") {
      defaultInterest = "HydraFacial Deluxe MD + Carbon Glow (6 Sessions)"
      defaultVal = "28000"
      defaultDoctor = "Dr. Naziya Baig"
    } else if (cat === "ACNE_SCARS") {
      defaultInterest = "MNRF + Subcision & TCA Cross Protocol"
      defaultVal = "40000"
      defaultDoctor = "Dr. Naziya Baig"
    } else if (cat === "ANTI_AGING") {
      defaultInterest = "Juvederm Voluma Fillers + Botox Forehead"
      defaultVal = "55000"
      defaultDoctor = "Dr. Naziya Baig"
    } else if (cat === "BRIDAL") {
      defaultInterest = "Celebrity Pre-Bridal Complete Transformation"
      defaultVal = "65000"
      defaultDoctor = "Dr. Naziya Baig"
    }

    setFormData((prev) => ({
      ...prev,
      treatmentCategory: cat,
      treatmentInterest: defaultInterest,
      value: defaultVal,
      doctorPreference: defaultDoctor,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Candidate full name is required")
      return
    }

    startTransition(async () => {
      try {
        let dueDate: string | null = null
        if (formData.dueDays) {
          const d = new Date()
          d.setDate(d.getDate() + parseInt(formData.dueDays, 10))
          dueDate = d.toISOString()
        }

        const res = await createProspect({
          name: formData.name.trim(),
          company: formData.treatmentInterest.trim() || null,
          treatmentCategory: formData.treatmentCategory,
          treatmentInterest: formData.treatmentInterest.trim(),
          candidateConcern: formData.candidateConcern.trim() || null,
          doctorPreference: formData.doctorPreference,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          stage: formData.stage as ProspectStage,
          value: formData.value ? parseFloat(formData.value) : 0,
          icpScore: Number(formData.icpScore),
          engagement: Number(formData.engagement),
          dueDate,
          assignedToId: formData.assignedToId || null,
          notes: formData.notes.trim() || null,
        })

        if (res.success) {
          toast.success(`Aesthetic candidate "${formData.name}" added to pipeline`)
          setOpen(false)
          setFormData({
            name: "",
            treatmentCategory: "HAIR_TRANSPLANT",
            treatmentInterest: "FUE Hair Transplant (3,000 Grafts)",
            candidateConcern: "",
            doctorPreference: "Hair Transplant Team (Satyam Centre)",
            email: "",
            phone: "",
            stage: "QUALIFIED",
            value: "75000",
            icpScore: 9,
            engagement: 35,
            dueDays: "3",
            assignedToId: "",
            notes: "",
          })
        } else {
          toast.error(res.error || "Failed to create prospect")
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
              <span>Add Treatment Prospect</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add Clinical Treatment Prospect</DialogTitle>
              <DialogDescription className="text-xs">
                Register a prospective patient evaluating hair restoration, laser aesthetics, or skin transformations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Candidate Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Candidate Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Kartik"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Treatment Category</Label>
              <Select
                value={formData.treatmentCategory}
                onValueChange={(val) => handleCategoryChange(val || "HAIR_TRANSPLANT")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Procedure Package & Clinical Concern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Proposed Procedure / Package</Label>
              <Input
                placeholder="e.g. FUE Hair Transplant (3,200 Grafts) + 4 GFC"
                value={formData.treatmentInterest}
                onChange={(e) => handleChange("treatmentInterest", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical Concern / Scalp & Skin State</Label>
              <Input
                placeholder="e.g. Norwood Stage 3 recession, vertex thinning"
                value={formData.candidateConcern}
                onChange={(e) => handleChange("candidateConcern", e.target.value)}
              />
            </div>
          </div>

          {/* Doctor & Pricing Quote */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Consulting Specialist</Label>
              <Select
                value={formData.doctorPreference}
                onValueChange={(val) => handleChange("doctorPreference", val || "Dr. Naziya Baig")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Naziya Baig">Dr. Naziya Baig (Cosmetologist)</SelectItem>
                  <SelectItem value="Reehal Baig">Reehal Baig (Trichologist)</SelectItem>
                  <SelectItem value="Hair Transplant Team (Satyam Centre)">
                    Hair Transplant Team (Satyam Centre)
                  </SelectItem>
                  <SelectItem value="Clinical Aesthetic Coordinator">
                    Aesthetic Coordinator
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Estimated Procedure Value (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="85,000"
                  className="pl-9 font-mono"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pipeline Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(val) => handleChange("stage", val || "QUALIFIED")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUALIFIED">Consultation Inquiry</SelectItem>
                  <SelectItem value="DEMO_BOOKED">Scalp / Skin Analysis</SelectItem>
                  <SelectItem value="PROPOSAL_SENT">Treatment Plan Sent</SelectItem>
                  <SelectItem value="NEGOTIATION">Treatment Negotiation</SelectItem>
                  <SelectItem value="CLOSED_WON">Procedure Booked</SelectItem>
                  <SelectItem value="CLOSED_LOST">Postponed / Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Details */}
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
                placeholder="candidate@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          {/* Candidacy, Readiness & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Candidacy Fit</Label>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {formData.icpScore}/10
                </span>
              </div>
              <Select
                value={String(formData.icpScore)}
                onValueChange={(val) => handleChange("icpScore", val ? parseInt(val, 10) : 9)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Candidacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0/10 (Not Suitable)</SelectItem>
                  <SelectItem value="5">5/10 (Moderate Density/Suitability)</SelectItem>
                  <SelectItem value="7">7/10 (Good Candidate)</SelectItem>
                  <SelectItem value="9">9/10 (Ideal Candidate)</SelectItem>
                  <SelectItem value="10">10/10 (Prime Candidate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Patient Readiness</Label>
                <span className="text-xs font-bold text-primary">{formData.engagement}%</span>
              </div>
              <Select
                value={String(formData.engagement)}
                onValueChange={(val) => handleChange("engagement", val ? parseInt(val, 10) : 35)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Readiness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20% (Information Gathering)</SelectItem>
                  <SelectItem value="35">35% (Ready for Consult)</SelectItem>
                  <SelectItem value="50">50% (Considering Quotes)</SelectItem>
                  <SelectItem value="75">75% (Comparing Dates)</SelectItem>
                  <SelectItem value="90">90% (Booking Imminent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target / Due In</Label>
              <Select
                value={formData.dueDays}
                onValueChange={(val) => handleChange("dueDays", val || "3")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Due" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Today</SelectItem>
                  <SelectItem value="1">Tomorrow</SelectItem>
                  <SelectItem value="3">In 3 days</SelectItem>
                  <SelectItem value="7">In 1 week</SelectItem>
                  <SelectItem value="14">In 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clinical Notes & Diagnostic Strategy */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Diagnostic Notes & Treatment Strategy</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Candidate inquired about unshaven FUE hairline lowering. Recommended digital trichoscopy scan."
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
              {isPending ? "Adding..." : "Add to Treatment Pipeline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
