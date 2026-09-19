import { getLeads, getLeadsSummary, getOverdueFollowUps } from "@/actions/leads"
import { getAllStaff, getCurrentUser } from "@/lib/auth"
import { OverdueFollowupsBanner } from "@/components/sales/leads/overdue-followups-banner"
import { LeadsTable } from "@/components/sales/leads/leads-table"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const [leads, summary, overdueLeads, staff, user] = await Promise.all([
    getLeads({}),
    getLeadsSummary(),
    getOverdueFollowUps(20),
    getAllStaff(),
    getCurrentUser(),
  ])

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads</h1>
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs font-semibold">
              Sales Pipeline
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track inquiries, manage follow-up deadlines, and convert high-intent prospects into clinic patients
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border bg-card/60 px-3.5 py-2 flex items-center gap-3 shadow-2xs">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <div className="leading-tight">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Pipeline Value
              </p>
              <p className="text-sm font-bold font-mono text-foreground">
                ₹{summary.totalPipelineValue.toLocaleString()}
              </p>
            </div>
          </div>

          {summary.overdueCount > 0 && (
            <div className="rounded-xl border border-red-200/80 bg-red-50/70 dark:bg-red-950/20 dark:border-red-900/40 px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="leading-tight">
                <p className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold tracking-wider">
                  Overdue
                </p>
                <p className="text-sm font-bold text-red-700 dark:text-red-300">
                  {summary.overdueCount} leads
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Overdue Follow-ups Alert Banner */}
      {overdueLeads.length > 0 && (
        <OverdueFollowupsBanner overdueLeads={overdueLeads} />
      )}

      {/* Main Leads Table & Pipeline */}
      <LeadsTable
        initialLeads={leads}
        summaryCounts={summary.counts}
        staff={staff}
        currentUserId={user?.id}
      />
    </div>
  )
}
