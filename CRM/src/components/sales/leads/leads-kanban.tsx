"use client"

import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Building2, Phone, Sparkles, CheckCircle2 } from "lucide-react"
import { updateLeadStatus } from "@/actions/leads"
import { toast } from "sonner"
import type { LeadItem } from "./leads-table"

const STAGES = [
  { key: "NEW", label: "New", color: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400" },
  { key: "CONTACTED", label: "Contacted", color: "border-sky-500/30 bg-sky-500/5 text-sky-600 dark:text-sky-400" },
  { key: "QUALIFIED", label: "Qualified", color: "border-violet-500/30 bg-violet-500/5 text-violet-600 dark:text-violet-400" },
  { key: "DEMO", label: "Demo / Consult", color: "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400" },
  { key: "PROPOSAL", label: "Proposal", color: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400" },
  { key: "WON", label: "Won", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
  { key: "LOST", label: "Lost", color: "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400" },
]

export function LeadsKanban({
  leads,
  onSelectLead,
}: {
  leads: LeadItem[]
  onSelectLead: (lead: LeadItem) => void
}) {
  const [isPending, startTransition] = useTransition()

  function advanceStage(leadId: string, currentStatus: string, direction: "prev" | "next") {
    const currentIndex = STAGES.findIndex((s) => s.key === currentStatus)
    if (currentIndex === -1) return
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= STAGES.length) return

    const nextStage = STAGES[nextIndex].key
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, nextStage as any)
        toast.success(`Moved lead to ${STAGES[nextIndex].label}`)
      } catch (err: any) {
        toast.error(err?.message || "Failed to update stage")
      }
    })
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px] scrollbar-thin">
      {STAGES.map((stage, stageIdx) => {
        const stageLeads = leads.filter((l) => l.status === stage.key)
        const stageTotal = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0)

        return (
          <div
            key={stage.key}
            className="w-72 shrink-0 rounded-xl border bg-card/60 flex flex-col shadow-2xs max-h-[750px]"
          >
            {/* Column Header */}
            <div className={`p-3 border-b flex items-center justify-between rounded-t-xl ${stage.color}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide uppercase">{stage.label}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-background/80 text-foreground shadow-2xs">
                  {stageLeads.length}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold opacity-90">
                {stageTotal > 0 ? `₹${stageTotal.toLocaleString()}` : "—"}
              </span>
            </div>

            {/* Cards Container */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
              {stageLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No leads in {stage.label}
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const isOverdue =
                    lead.followUpDate &&
                    new Date(lead.followUpDate).getTime() < Date.now() &&
                    !["WON", "LOST"].includes(lead.status)

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="rounded-lg border bg-card p-3 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {lead.name}
                          </h4>
                          {lead.company && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-[140px]">{lead.company}</span>
                            </p>
                          )}
                        </div>

                        {lead.value && (
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            ₹{lead.value.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Badges & Meta */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                          {lead.source}
                        </Badge>

                        {lead.icpScore !== null && (
                          <Badge
                            className={
                              lead.icpScore >= 8
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0"
                                : lead.icpScore >= 5
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0"
                                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-[10px] px-1.5 py-0"
                            }
                          >
                            ICP {lead.icpScore}/10
                          </Badge>
                        )}

                        {isOverdue && (
                          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 ml-auto">
                            Overdue
                          </span>
                        )}
                      </div>

                      {/* Footer & Advance buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-muted/50 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px]">
                            {lead.assignedTo ? lead.assignedTo.name.charAt(0) : "?"}
                          </div>
                          <span className="truncate max-w-[80px]">
                            {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          {stageIdx > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => advanceStage(lead.id, lead.status, "prev")}
                              disabled={isPending}
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                          )}
                          {stageIdx < STAGES.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => advanceStage(lead.id, lead.status, "next")}
                              disabled={isPending}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
