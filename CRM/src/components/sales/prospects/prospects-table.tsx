"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Calendar,
  Eye,
  IndianRupee,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Sparkles,
  Briefcase,
  User,
  Stethoscope,
  Scissors,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ProspectStage } from "@/types/database"

interface TableProspect {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  stage: ProspectStage
  value: number
  icpScore: number
  engagement: number
  dueDate: string | null
  notes: string | null
  treatmentCategory?: string | null
  treatmentInterest?: string | null
  candidateConcern?: string | null
  doctorPreference?: string | null
  assignedTo?: { id: string; name: string } | null
}

const STAGE_LABELS: Record<ProspectStage, { label: string; color: string; bg: string }> = {
  QUALIFIED: { label: "Inquiry", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/10 border-amber-500/20" },
  DEMO_BOOKED: { label: "Analysis Booked", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-500/10 border-blue-500/20" },
  PROPOSAL_SENT: { label: "Plan Sent", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-500/10 border-purple-500/20" },
  NEGOTIATION: { label: "Negotiation", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CLOSED_WON: { label: "Procedure Booked", color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-500/10 border-teal-500/20" },
  CLOSED_LOST: { label: "Lost", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-500/10 border-rose-500/20" },
}

function getCategoryBadge(cat: string | null | undefined) {
  switch (cat) {
    case "HAIR_TRANSPLANT":
      return { label: "Hair Transplant", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200" }
    case "HAIR_RESTORATION":
      return { label: "GFC / PRP Hair", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200" }
    case "SKIN_AESTHETICS":
      return { label: "Medi-Facial", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200" }
    case "ANTI_AGING":
      return { label: "Botox & Fillers", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200" }
    case "ACNE_SCARS":
      return { label: "Acne Scar MNRF", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200" }
    case "BRIDAL":
      return { label: "Pre-Bridal", color: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200" }
    default:
      return { label: "Aesthetic Plan", color: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200" }
  }
}

export function ProspectsTable({
  prospects,
  onSelectProspect,
  onStageChange,
  onConvertToClient,
}: {
  prospects: TableProspect[]
  onSelectProspect: (prospect: TableProspect) => void
  onStageChange: (id: string, stage: ProspectStage) => void
  onConvertToClient: (prospect: TableProspect) => void
}) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [stageFilter, setStageFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState<"value" | "engagement" | "dueDate">("value")

  const now = new Date()

  const filtered = prospects.filter((p) => {
    if (stageFilter !== "ALL" && p.stage !== stageFilter) return false
    if (categoryFilter !== "ALL" && p.treatmentCategory !== categoryFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.treatmentInterest && p.treatmentInterest.toLowerCase().includes(q)) ||
      (p.candidateConcern && p.candidateConcern.toLowerCase().includes(q)) ||
      (p.company && p.company.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    )
  })

  filtered.sort((a, b) => {
    if (sortBy === "value") return (b.value || 0) - (a.value || 0)
    if (sortBy === "engagement") return (b.engagement || 0) - (a.engagement || 0)
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    return 0
  })

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates, treatments, concerns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "ALL")}>
            <SelectTrigger className="h-9 text-xs w-[145px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Treatments</SelectItem>
              <SelectItem value="HAIR_TRANSPLANT">Hair Transplant</SelectItem>
              <SelectItem value="HAIR_RESTORATION">Hair Restoration</SelectItem>
              <SelectItem value="SKIN_AESTHETICS">Skin & Medi-Facials</SelectItem>
              <SelectItem value="ACNE_SCARS">Acne Scars</SelectItem>
              <SelectItem value="ANTI_AGING">Anti-Aging & Botox</SelectItem>
              <SelectItem value="BRIDAL">Pre-Bridal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={(val) => setStageFilter(val || "ALL")}>
            <SelectTrigger className="h-9 text-xs w-[135px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              <SelectItem value="QUALIFIED">Inquiry</SelectItem>
              <SelectItem value="DEMO_BOOKED">Analysis Booked</SelectItem>
              <SelectItem value="PROPOSAL_SENT">Plan Sent</SelectItem>
              <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
              <SelectItem value="CLOSED_WON">Procedure Booked</SelectItem>
              <SelectItem value="CLOSED_LOST">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="h-9 text-xs w-[125px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Highest Quote</SelectItem>
              <SelectItem value="engagement">Readiness</SelectItem>
              <SelectItem value="dueDate">Target Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
              <tr>
                <th className="py-3 px-4">CANDIDATE & PROCEDURE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">CLINICAL CONCERN</th>
                <th className="py-3 px-4">STAGE</th>
                <th className="py-3 px-4">PROCEDURE QUOTE</th>
                <th className="py-3 px-4">CANDIDACY FIT</th>
                <th className="py-3 px-4">SPECIALIST</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No clinical treatment prospects found.
                  </td>
                </tr>
              ) : (
                filtered.map((prospect) => {
                  const stageCfg = STAGE_LABELS[prospect.stage] || STAGE_LABELS.QUALIFIED
                  const catBadge = getCategoryBadge(prospect.treatmentCategory)

                  let isOverdue = false
                  let dueLabel = "Flexible"
                  if (prospect.dueDate) {
                    const d = new Date(prospect.dueDate)
                    const diffDays = Math.round(
                      (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    )
                    const formatted = d.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })

                    if (diffDays < 0 && prospect.stage !== "CLOSED_WON") {
                      isOverdue = true
                      dueLabel = `${formatted} (${Math.abs(diffDays)}d overdue)`
                    } else {
                      dueLabel = formatted
                    }
                  }

                  return (
                    <tr
                      key={prospect.id}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => onSelectProspect(prospect)}
                    >
                      {/* Name & Treatment Interest */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground hover:text-primary transition-colors text-sm">
                          {prospect.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">
                          {prospect.treatmentInterest || prospect.company || "Aesthetic Assessment"}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold",
                            catBadge.color
                          )}
                        >
                          {catBadge.label}
                        </span>
                      </td>

                      {/* Clinical Concern */}
                      <td className="py-3.5 px-4 text-muted-foreground text-xs font-normal">
                        {prospect.candidateConcern || "General Inquiry"}
                      </td>

                      {/* Stage Dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={prospect.stage}
                          onValueChange={(val) => onStageChange(prospect.id, val as ProspectStage)}
                        >
                          <SelectTrigger className="h-7 text-[11px] font-semibold border-none px-2 rounded-md bg-muted/50 hover:bg-muted">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QUALIFIED">Inquiry</SelectItem>
                            <SelectItem value="DEMO_BOOKED">Analysis Booked</SelectItem>
                            <SelectItem value="PROPOSAL_SENT">Plan Sent</SelectItem>
                            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                            <SelectItem value="CLOSED_WON">Procedure Booked</SelectItem>
                            <SelectItem value="CLOSED_LOST">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Procedure Quote */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{prospect.value ? prospect.value.toLocaleString("en-IN") : "0"}
                      </td>

                      {/* Candidacy Fit */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className="border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 bg-amber-50/50 text-[10px] font-mono"
                        >
                          Fit {prospect.icpScore}/10
                        </Badge>
                      </td>

                      {/* Specialist */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                          <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            {prospect.doctorPreference || prospect.assignedTo?.name || "Dr. Naziya Baig"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/20 font-semibold"
                            onClick={() => onConvertToClient(prospect)}
                          >
                            <Briefcase className="h-3 w-3" />
                            <span>Retainer</span>
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onSelectProspect(prospect)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
