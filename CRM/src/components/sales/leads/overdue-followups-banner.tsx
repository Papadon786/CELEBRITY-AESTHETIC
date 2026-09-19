"use client"

import { useState } from "react"
import { AlertCircle, ChevronDown, ChevronUp, Phone, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OverdueLead {
  id: string
  name: string
  company: string | null
  phone: string | null
  status: string
  value: number | null
  assignedTo: { id: string; name: string; role: string } | null
  followUpDate: string | null
  overdueDays: number
}

export function OverdueFollowupsBanner({
  overdueLeads,
  onSelectLead,
}: {
  overdueLeads: OverdueLead[]
  onSelectLead?: (leadId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  if (!overdueLeads || overdueLeads.length === 0) {
    return null
  }

  const displayedLeads = expanded ? overdueLeads : overdueLeads.slice(0, 5)
  const remainingCount = overdueLeads.length - 5

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 transition-all">
      <div className="space-y-2.5">
        {displayedLeads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onSelectLead?.(lead.id)}
            className="flex items-center justify-between py-1 text-sm cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 rounded-lg transition-colors group"
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {lead.name}
              </span>
              {lead.company && (
                <span className="text-muted-foreground text-xs font-normal">
                  {lead.company}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {lead.overdueDays}d overdue
              </span>
            </div>
          </div>
        ))}
      </div>

      {overdueLeads.length > 5 && (
        <div className="pt-2 text-center border-t border-amber-200/60 dark:border-amber-900/40 mt-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {expanded
              ? "Collapse overdue follow-ups"
              : `Show all ${overdueLeads.length} overdue follow-ups`}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
