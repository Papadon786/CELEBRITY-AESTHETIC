"use client"

import { useState, useTransition } from "react"
import {
  Search,
  Filter,
  ArrowUpDown,
  Kanban as KanbanIcon,
  Table as TableIcon,
  Phone,
  MessageSquare,
  Building2,
  UserCheck,
  ChevronDown,
  AlertCircle,
  MoreHorizontal,
  Plus,
  Upload,
  Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddLeadDialog } from "./add-lead-dialog"
import { ImportLeadsDialog } from "./import-leads-dialog"
import { LeadDetailSheet } from "./lead-detail-sheet"
import { LeadsKanban } from "./leads-kanban"
import { updateLeadStatus, logLeadActivity, promoteLeadToProspect } from "@/actions/leads"
import { toast } from "sonner"

export interface LeadItem {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: string
  source: string
  value: number | null
  icpScore: number | null
  assignedToId: string | null
  assignedTo: { id: string; name: string; email?: string; role: string } | null
  followUpDate: string | null
  notes: string | null
  lostReason: string | null
  convertedPatientId: string | null
  convertedPatient: { id: string; uhid: string; firstName: string; lastName: string | null } | null
  createdAt: string
  updatedAt: string
}

interface StaffMember {
  id: string
  name: string
  role: string
}

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" },
  CONTACTED: { label: "Contacted", color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900" },
  QUALIFIED: { label: "Qualified", color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900" },
  DEMO: { label: "Demo / Consult", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900" },
  PROPOSAL: { label: "Proposal Sent", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" },
  NEGOTIATION: { label: "Negotiation", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900" },
  WON: { label: "Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900" },
  LOST: { label: "Lost", color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900" },
}

export function LeadsTable({
  initialLeads,
  summaryCounts,
  staff,
  currentUserId,
}: {
  initialLeads: LeadItem[]
  summaryCounts: Record<string, number>
  staff: StaffMember[]
  currentUserId?: string
}) {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")
  const [activeStage, setActiveStage] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "value_desc" | "followup_asc">("newest")
  const [isPending, startTransition] = useTransition()

  // Filter leads based on client criteria for fast interactivity
  let filteredLeads = initialLeads.filter((lead) => {
    if (activeTab === "my" && currentUserId && lead.assignedToId !== currentUserId) {
      return false
    }
    if (activeStage !== "ALL" && lead.status !== activeStage) {
      return false
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      const matches =
        lead.name.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q))
      if (!matches) return false
    }
    return true
  })

  // Sort
  filteredLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    if (sortBy === "value_desc") {
      return (b.value || 0) - (a.value || 0)
    }
    if (sortBy === "followup_asc") {
      const dateA = a.followUpDate ? new Date(a.followUpDate).getTime() : Infinity
      const dateB = b.followUpDate ? new Date(b.followUpDate).getTime() : Infinity
      return dateA - dateB
    }
    return 0
  })

  function handleOpenDetail(lead: LeadItem) {
    setSelectedLead(lead)
    setSheetOpen(true)
  }

  function handleQuickStageChange(leadId: string, newStage: string) {
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, newStage as any)
        toast.success(`Updated stage to ${STAGE_CONFIG[newStage]?.label || newStage}`)
      } catch (err: any) {
        toast.error(err?.message || "Failed to update stage")
      }
    })
  }

  function handleQuickCall(e: React.MouseEvent, lead: LeadItem) {
    e.stopPropagation()
    if (!lead.phone) {
      toast.info("No phone number recorded for this lead")
      return
    }
    logLeadActivity(lead.id, "CALL", "Outbound Call", `Outreach call to ${lead.phone}`)
    window.location.href = `tel:${lead.phone}`
  }

  return (
    <div className="space-y-4">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter button */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-10 gap-1.5 font-medium">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span>Filter</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase">
                Filter by Source
              </div>
              {["ALL", "WEBSITE", "LINKEDIN", "INSTAGRAM", "GOOGLE", "REFERRAL", "WALK_IN"].map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => toast.info(`Filtering by ${s}`)}
                  className="text-xs"
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-10 gap-1.5 font-medium">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <span>{sortBy === "newest" ? "Newest" : sortBy === "value_desc" ? "Highest Value" : "Follow-up"}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("value_desc")}>Highest Deal Value</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("followup_asc")}>Next Follow-up Due</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Kanban / Table Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "table" ? "kanban" : "table")}
            className="h-10 gap-1.5 font-medium"
          >
            {viewMode === "table" ? (
              <>
                <KanbanIcon className="h-4 w-4" />
                <span>Kanban</span>
              </>
            ) : (
              <>
                <TableIcon className="h-4 w-4" />
                <span>Table</span>
              </>
            )}
          </Button>

          {/* Import CSV */}
          <ImportLeadsDialog />

          {/* Add Lead Button */}
          <AddLeadDialog staff={staff} />
        </div>
      </div>

      {/* Tabs: All Leads / My Leads */}
      <div className="flex items-center gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`pb-2 text-sm font-semibold border-b-2 px-3 transition-colors ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Leads
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("my")}
          className={`pb-2 text-sm font-semibold border-b-2 px-3 transition-colors ${
            activeTab === "my"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Leads
        </button>
      </div>

      {/* Funnel Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { key: "ALL", label: "All", count: summaryCounts.ALL || initialLeads.length },
          { key: "NEW", label: "New", count: summaryCounts.NEW || 0 },
          { key: "CONTACTED", label: "Contacted", count: summaryCounts.CONTACTED || 0 },
          { key: "QUALIFIED", label: "Qualified", count: summaryCounts.QUALIFIED || 0 },
          { key: "DEMO", label: "Demo", count: summaryCounts.DEMO || 0 },
          { key: "PROPOSAL", label: "Proposal", count: summaryCounts.PROPOSAL || 0 },
          { key: "NEGOTIATION", label: "Negotiation", count: summaryCounts.NEGOTIATION || 0 },
          { key: "WON", label: "Won", count: summaryCounts.WON || 0 },
          { key: "LOST", label: "Lost", count: summaryCounts.LOST || 0 },
        ].map((pill) => {
          const isActive = activeStage === pill.key
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => setActiveStage(pill.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? "bg-foreground text-background shadow-2xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{pill.label}</span>
              <span className={`text-[11px] font-mono ${isActive ? "opacity-90" : "opacity-75"}`}>
                {pill.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main View: Table or Kanban */}
      {viewMode === "kanban" ? (
        <LeadsKanban leads={filteredLeads} onSelectLead={handleOpenDetail} />
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-2 text-center">Quick</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3">Value</th>
                  <th className="py-3 px-3">Follow-up</th>
                  <th className="py-3 px-3">ICP Score</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      No leads matching current filters. Click "+ Add Lead" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const stage = STAGE_CONFIG[lead.status] || {
                      label: lead.status,
                      color: "bg-muted text-muted-foreground",
                    }

                    // Calculate follow-up status
                    let followUpText = "—"
                    let isOverdue = false
                    if (lead.followUpDate) {
                      const fDate = new Date(lead.followUpDate)
                      const diffDays = Math.round((fDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      if (diffDays < 0 && !["WON", "LOST"].includes(lead.status)) {
                        isOverdue = true
                        followUpText = `${Math.abs(diffDays)}d overdue`
                      } else if (diffDays === 0) {
                        followUpText = "Today"
                      } else if (diffDays === 1) {
                        followUpText = "Tomorrow"
                      } else {
                        followUpText = `In ${diffDays}d`
                      }
                    }

                    // Assigned initials
                    const repInitials = lead.assignedTo
                      ? lead.assignedTo.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "—"

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleOpenDetail(lead)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        {/* Lead column */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                              {lead.name}
                            </span>
                            <span className="text-muted-foreground text-xs font-normal truncate max-w-[200px]">
                              {lead.company || lead.email || "No company"}
                            </span>
                          </div>
                        </td>

                        {/* Status Column with quick dropdown */}
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button
                                  type="button"
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${stage.color}`}
                                >
                                  <span>{stage.label}</span>
                                  <ChevronDown className="h-3 w-3 opacity-60" />
                                </button>
                              }
                            />
                            <DropdownMenuContent align="start" className="w-40">
                              {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => handleQuickStageChange(lead.id, key)}
                                  className="text-xs font-medium"
                                >
                                  {cfg.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>

                        {/* Quick Action icon */}
                        <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          {lead.phone ? (
                            <button
                              type="button"
                              onClick={(e) => handleQuickCall(e, lead)}
                              title={`Call ${lead.phone}`}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="py-3 px-3 text-muted-foreground font-medium">
                          {lead.source}
                        </td>

                        {/* Assigned To */}
                        <td className="py-3 px-3">
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-[10px] shrink-0">
                                {repInitials}
                              </div>
                              <span className="font-medium truncate max-w-[120px]">
                                {lead.assignedTo.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Value */}
                        <td className="py-3 px-3 font-mono font-semibold text-foreground">
                          {lead.value ? `₹${lead.value.toLocaleString()}` : "—"}
                        </td>

                        {/* Follow-up */}
                        <td className="py-3 px-3">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {followUpText}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{followUpText}</span>
                          )}
                        </td>

                        {/* ICP Score */}
                        <td className="py-3 px-3">
                          {lead.icpScore !== null ? (
                            lead.icpScore <= 3 ? (
                              <span className="text-red-500 font-medium text-xs">
                                Disqualify {lead.icpScore}/10
                              </span>
                            ) : lead.icpScore >= 8 ? (
                              <span className="text-emerald-600 font-medium text-xs">
                                High Fit {lead.icpScore}/10
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium text-xs">
                                Fit {lead.icpScore}/10
                              </span>
                            )
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDetail(lead)}>
                                View Details & Activity
                              </DropdownMenuItem>
                              {lead.phone && (
                                <DropdownMenuItem onClick={(e) => handleQuickCall(e as any, lead)}>
                                  Call Lead
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={async () => {
                                  const res = await promoteLeadToProspect(lead.id)
                                  if (res.success) {
                                    toast.success(`Promoted ${lead.name} to Qualified Sales Prospect`)
                                  } else {
                                    toast.error(res.error || "Failed to promote lead")
                                  }
                                }}
                                className="text-amber-600 dark:text-amber-400 font-medium"
                              >
                                <Star className="h-3.5 w-3.5 mr-1" />
                                Promote to Prospect
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenDetail(lead)}
                                className="text-primary font-medium"
                              >
                                Convert to Patient EMR
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Slide-over Sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        staff={staff}
      />
    </div>
  )
}
