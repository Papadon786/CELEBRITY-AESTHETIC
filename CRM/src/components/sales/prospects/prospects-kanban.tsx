"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Stethoscope,
  Scissors,
  Sparkle,
  TrendingUp,
  User,
  IndianRupee,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProspectStage } from "@/types/database"

interface KanbanProspect {
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

const STAGE_CONFIG: Record<
  ProspectStage,
  { label: string; subLabel: string; badgeColor: string }
> = {
  QUALIFIED: {
    label: "CONSULTATION INQUIRY",
    subLabel: "Qualified hair & skin inquiries",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  DEMO_BOOKED: {
    label: "SCALP / SKIN ANALYSIS",
    subLabel: "Booked for clinical diagnostics",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  PROPOSAL_SENT: {
    label: "TREATMENT PLAN SENT",
    subLabel: "Procedure package quote sent",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  NEGOTIATION: {
    label: "TREATMENT NEGOTIATION",
    subLabel: "Session scheduling & EMI review",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  CLOSED_WON: {
    label: "PROCEDURE BOOKED",
    subLabel: "Deposit received · EMR activated",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  },
  CLOSED_LOST: {
    label: "POSTPONED / LOST",
    subLabel: "Not progressing currently",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

function formatINRShort(val: number): string {
  if (!val) return "₹0"
  if (val >= 100000) {
    const l = val / 100000
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(0)}k`
  }
  return `₹${val.toLocaleString("en-IN")}`
}

function getCategoryBadge(cat: string | null | undefined) {
  switch (cat) {
    case "HAIR_TRANSPLANT":
      return { label: "Hair Transplant", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200" }
    case "HAIR_RESTORATION":
      return { label: "GFC / PRP Hair", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200" }
    case "SKIN_AESTHETICS":
      return { label: "Medi-Facial & Glow", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200" }
    case "ANTI_AGING":
      return { label: "Botox & Fillers", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200" }
    case "ACNE_SCARS":
      return { label: "Acne Scar MNRF", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200" }
    case "BRIDAL":
      return { label: "Bridal Transformation", color: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200" }
    default:
      return { label: "Aesthetic Plan", color: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200" }
  }
}

export function ProspectsKanban({
  prospects,
  onSelectProspect,
  onStageChange,
}: {
  prospects: KanbanProspect[]
  onSelectProspect: (prospect: KanbanProspect) => void
  onStageChange: (id: string, newStage: ProspectStage) => void
}) {
  const stageOrder: ProspectStage[] = [
    "QUALIFIED",
    "DEMO_BOOKED",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "CLOSED_WON",
  ]

  const now = new Date()

  // Group prospects by stage
  const grouped: Record<ProspectStage, KanbanProspect[]> = {
    QUALIFIED: [],
    DEMO_BOOKED: [],
    PROPOSAL_SENT: [],
    NEGOTIATION: [],
    CLOSED_WON: [],
    CLOSED_LOST: [],
  }

  for (const p of prospects) {
    if (grouped[p.stage]) {
      grouped[p.stage].push(p)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
      {stageOrder.map((stageKey, colIdx) => {
        const stageProspects = grouped[stageKey] || []
        const totalStageValue = stageProspects.reduce((sum, p) => sum + (p.value || 0), 0)
        const cfg = STAGE_CONFIG[stageKey]

        return (
          <div
            key={stageKey}
            className="flex flex-col rounded-xl bg-muted/20 border border-border/50 p-2.5 min-h-[480px]"
          >
            {/* Column Header */}
            <div className="pb-2.5 mb-2 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-wider text-foreground uppercase">
                    {cfg.label}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    ({stageProspects.length})
                  </span>
                </div>

                {totalStageValue > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatINRShort(totalStageValue)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.subLabel}</p>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5 flex-1">
              {stageProspects.length === 0 ? (
                <div className="h-32 rounded-lg border-2 border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground/60 font-medium">
                  Drop candidate here
                </div>
              ) : (
                stageProspects.map((prospect) => {
                  let isOverdue = false
                  let dueLabel = ""

                  if (prospect.dueDate) {
                    const d = new Date(prospect.dueDate)
                    const diffDays = Math.round(
                      (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    )
                    const dayNum = d.getDate()
                    const monthName = d.toLocaleDateString("en-IN", { month: "short" })

                    if (diffDays < 0 && stageKey !== "CLOSED_WON") {
                      isOverdue = true
                      dueLabel = `Overdue ${dayNum} ${monthName}`
                    } else if (diffDays === 0) {
                      dueLabel = "Target Today"
                    } else {
                      dueLabel = `Target ${dayNum} ${monthName}`
                    }
                  }

                  const engagement = prospect.engagement || 25
                  const icpScore = prospect.icpScore !== undefined ? prospect.icpScore : 8
                  const categoryBadge = getCategoryBadge(prospect.treatmentCategory)

                  return (
                    <div
                      key={prospect.id}
                      onClick={() => onSelectProspect(prospect)}
                      className={cn(
                        "group relative rounded-xl border bg-card p-3.5 text-left shadow-2xs hover:shadow-md transition-all duration-150 cursor-pointer space-y-2.5",
                        isOverdue
                          ? "border-amber-300 dark:border-amber-900/60 hover:border-amber-400"
                          : "border-border/80 hover:border-foreground/30"
                      )}
                    >
                      {/* Top Row: Doctor/Procedure Badge */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-tight",
                            categoryBadge.color
                          )}
                        >
                          {categoryBadge.label}
                        </span>

                        {stageKey === "CLOSED_WON" && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 font-bold">
                            <CheckCircle className="h-3 w-3" /> Booked
                          </span>
                        )}
                      </div>

                      {/* Candidate Name & Clinical Procedure Note */}
                      <div>
                        <h4 className="text-sm font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                          {prospect.name}
                        </h4>
                        <p className="text-xs font-semibold text-foreground/85 truncate mt-0.5">
                          {prospect.treatmentInterest || prospect.company || "Clinical Consultation"}
                        </p>
                        {prospect.candidateConcern && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {prospect.candidateConcern}
                          </p>
                        )}
                      </div>

                      {/* Procedure Price Quote if present */}
                      {prospect.value > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-muted-foreground">Procedure Quote</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                            ₹{prospect.value.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {/* Readiness / Engagement Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Patient Readiness</span>
                          <span className="font-semibold text-rose-500">{engagement}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              engagement > 50
                                ? "bg-emerald-500"
                                : engagement > 25
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(100, Math.max(8, engagement))}%` }}
                          />
                        </div>
                      </div>

                      {/* Badges Row: Candidacy Score & Target Date */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="inline-flex items-center rounded-md border border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                          Candidacy {icpScore}/10
                        </span>

                        {dueLabel && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium font-mono",
                              isOverdue
                                ? "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/20"
                                : "text-muted-foreground bg-muted/40"
                            )}
                          >
                            {isOverdue && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                            <span>{dueLabel}</span>
                          </span>
                        )}
                      </div>

                      {/* Doctor / Specialist Assigned */}
                      {prospect.doctorPreference && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                          <Stethoscope className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{prospect.doctorPreference}</span>
                        </div>
                      )}

                      {/* Quick stage advance buttons on card hover */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity pt-1 flex items-center justify-between border-t border-border/40 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {colIdx > 0 ? (
                          <button
                            onClick={() => onStageChange(prospect.id, stageOrder[colIdx - 1])}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted"
                            title="Move back"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                        ) : (
                          <span />
                        )}

                        <span className="text-[10px] text-muted-foreground font-medium">
                          Quick Advance
                        </span>

                        {colIdx < stageOrder.length - 1 ? (
                          <button
                            onClick={() => onStageChange(prospect.id, stageOrder[colIdx + 1])}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted"
                            title="Advance stage"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
