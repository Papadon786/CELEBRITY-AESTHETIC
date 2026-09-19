"use client"

import { useState, useTransition } from "react"
import {
  Columns3,
  Table as TableIcon,
  BarChart3,
  Lightbulb,
  Plus,
  Stethoscope,
  Scissors,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AddProspectDialog } from "./add-prospect-dialog"
import { ProspectsKanban } from "./prospects-kanban"
import { ProspectsTable } from "./prospects-table"
import { ProspectsAnalytics } from "./prospects-analytics"
import { ProspectsInsights } from "./prospects-insights"
import { ProspectDetailSheet } from "./prospect-detail-sheet"
import { updateProspectStage, convertProspectToClient } from "@/actions/prospects"
import type { ProspectStage } from "@/types/database"

interface ProspectsViewProps {
  initialProspects: any[]
  stats: {
    totalCount: number
    inDemoCount: number
    inProposalCount: number
    pipelineValue: number
  }
  staff: Array<{ id: string; name: string; role: string }>
}

function formatPipelineINR(val: number): string {
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

export function ProspectsView({ initialProspects, stats, staff }: ProspectsViewProps) {
  const [prospects, setProspects] = useState(initialProspects)
  const [activeTab, setActiveTab] = useState<"kanban" | "table" | "analytics" | "insights">("kanban")
  const [selectedProspect, setSelectedProspect] = useState<any | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Handler for stage change
  function handleStageChange(id: string, newStage: ProspectStage) {
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage: newStage } : p))
    )
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev: any) => ({ ...prev, stage: newStage }))
    }

    startTransition(async () => {
      try {
        const res = await updateProspectStage(id, newStage)
        if (!res.success) {
          toast.error(res.error || "Failed to update stage")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update stage")
      }
    })
  }

  // Handler for converting to client
  function handleConvertToClient(prospect: any) {
    startTransition(async () => {
      try {
        const res = await convertProspectToClient(prospect.id)
        if (res.success) {
          toast.success(`Candidate ${prospect.name} converted to VIP Aesthetic Client Retainer!`)
          setProspects((prev) =>
            prev.map((p) =>
              p.id === prospect.id ? { ...p, stage: "CLOSED_WON" as ProspectStage } : p
            )
          )
        } else {
          toast.error(res.error || "Conversion failed")
        }
      } catch (err: any) {
        toast.error(err.message || "Conversion failed")
      }
    })
  }

  function handleOpenDetail(p: any) {
    setSelectedProspect(p)
    setSheetOpen(true)
  }

  // Recalculate stats dynamically if local state changes
  const totalCount = prospects.length
  const inAnalysisCount = prospects.filter((p) => p.stage === "DEMO_BOOKED").length
  const inPlanSentCount = prospects.filter((p) => p.stage === "PROPOSAL_SENT").length
  const pipelineVal = prospects
    .filter((p) => p.stage !== "CLOSED_LOST")
    .reduce((sum, p) => sum + (Number(p.value) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>AESTHETIC CLINICAL SALES</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-primary font-bold">Crown Celebrity Aesthetic</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Aesthetic Treatment Prospects
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Qualified clinical candidates for hair restoration, skin transformations & aesthetic procedures · {totalCount} total
          </p>
        </div>

        <AddProspectDialog staff={staff} />
      </div>

      {/* 4 Clinical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL CANDIDATES */}
        <div className="rounded-xl border bg-card/60 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            TOTAL CANDIDATES
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Hair, skin & laser inquiries
          </div>
        </div>

        {/* IN SCALP / SKIN ANALYSIS */}
        <div className="rounded-xl border bg-card/60 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            IN CLINICAL ANALYSIS
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {inAnalysisCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Trichoscopy & 3D scans
          </div>
        </div>

        {/* TREATMENT PLANS SENT */}
        <div className="rounded-xl border bg-card/60 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            TREATMENT PLANS SENT
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {inPlanSentCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Active procedure quotes
          </div>
        </div>

        {/* PROCEDURE PIPELINE */}
        <div className="rounded-xl border bg-card/60 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            PROCEDURE PIPELINE
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {formatPipelineINR(pipelineVal)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Total prospective procedure value
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Kanban | Table | Analytics | Insights */}
      <div className="flex items-center gap-1 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "kanban"
              ? "bg-foreground/5 text-foreground font-bold shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Columns3 className="h-4 w-4" />
          <span>Consultation Kanban</span>
        </button>

        <button
          onClick={() => setActiveTab("table")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "table"
              ? "bg-foreground/5 text-foreground font-bold shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <TableIcon className="h-4 w-4" />
          <span>Treatment Directory</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "analytics"
              ? "bg-foreground/5 text-foreground font-bold shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Procedure Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "insights"
              ? "bg-foreground/5 text-foreground font-bold shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Clinical Recommendations</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "kanban" && (
        <ProspectsKanban
          prospects={prospects}
          onSelectProspect={handleOpenDetail}
          onStageChange={handleStageChange}
        />
      )}

      {activeTab === "table" && (
        <ProspectsTable
          prospects={prospects}
          onSelectProspect={handleOpenDetail}
          onStageChange={handleStageChange}
          onConvertToClient={handleConvertToClient}
        />
      )}

      {activeTab === "analytics" && <ProspectsAnalytics prospects={prospects} />}

      {activeTab === "insights" && (
        <ProspectsInsights prospects={prospects} onSelectProspect={handleOpenDetail} />
      )}

      {/* Prospect Detail Drawer */}
      <ProspectDetailSheet
        prospect={selectedProspect}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStageChange={handleStageChange}
      />
    </div>
  )
}
