"use client"

import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Target,
  Sparkles,
  CheckCircle2,
  Users,
  IndianRupee,
  Stethoscope,
  Scissors,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ProspectStage } from "@/types/database"

interface AnalyticsProspect {
  id: string
  name: string
  stage: ProspectStage
  value: number
  icpScore: number
  engagement: number
  treatmentCategory?: string | null
}

export function ProspectsAnalytics({ prospects }: { prospects: AnalyticsProspect[] }) {
  const totalValue = prospects.reduce((sum, p) => sum + (p.value || 0), 0)
  const totalCount = prospects.length

  const stageBreakdown: Record<string, { label: string; count: number; value: number; color: string }> = {
    QUALIFIED: { label: "Consultation Inquiry", count: 0, value: 0, color: "bg-amber-500" },
    DEMO_BOOKED: { label: "Scalp / Skin Analysis", count: 0, value: 0, color: "bg-blue-500" },
    PROPOSAL_SENT: { label: "Treatment Plan Sent", count: 0, value: 0, color: "bg-purple-500" },
    NEGOTIATION: { label: "Treatment Negotiation", count: 0, value: 0, color: "bg-emerald-500" },
    CLOSED_WON: { label: "Procedure Booked", count: 0, value: 0, color: "bg-teal-500" },
    CLOSED_LOST: { label: "Postponed / Lost", count: 0, value: 0, color: "bg-rose-500" },
  }

  const categoryBreakdown: Record<string, { label: string; count: number; value: number; color: string }> = {
    HAIR_TRANSPLANT: { label: "Hair Transplant (FUE & Bio-FUE)", count: 0, value: 0, color: "bg-purple-500" },
    HAIR_RESTORATION: { label: "Hair Restoration (GFC, PRP, Exosomes)", count: 0, value: 0, color: "bg-blue-500" },
    SKIN_AESTHETICS: { label: "Skin Care & Medi-Facials", count: 0, value: 0, color: "bg-cyan-500" },
    ACNE_SCARS: { label: "Acne Scars & Laser Resurfacing", count: 0, value: 0, color: "bg-emerald-500" },
    ANTI_AGING: { label: "Anti-Aging & Injectables", count: 0, value: 0, color: "bg-rose-500" },
    BRIDAL: { label: "Pre-Bridal Makeovers", count: 0, value: 0, color: "bg-pink-500" },
  }

  let highIcpCount = 0
  let highReadinessCount = 0

  for (const p of prospects) {
    if (stageBreakdown[p.stage]) {
      stageBreakdown[p.stage].count += 1
      stageBreakdown[p.stage].value += p.value || 0
    }
    const cat = p.treatmentCategory || "HAIR_TRANSPLANT"
    if (categoryBreakdown[cat]) {
      categoryBreakdown[cat].count += 1
      categoryBreakdown[cat].value += p.value || 0
    }
    if ((p.icpScore || 0) >= 8) highIcpCount += 1
    if ((p.engagement || 0) >= 30) highReadinessCount += 1
  }

  const avgDealSize = totalCount > 0 ? Math.round(totalValue / totalCount) : 0
  const winRate = totalCount > 0 ? Math.round((stageBreakdown.CLOSED_WON.count / totalCount) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Procedure Quote
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              ₹{avgDealSize.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all active aesthetic treatment plans</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Procedure Booking Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
              {winRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stageBreakdown.CLOSED_WON.count} clinical procedures confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              High Candidacy (8+)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {highIcpCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((highIcpCount / (totalCount || 1)) * 100)}% ideal candidates for procedures
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              High Patient Readiness
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-500">
              {highReadinessCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Candidates with &ge;30% readiness</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stage Breakdown Bars */}
        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Consultation Pipeline Stages</CardTitle>
            <CardDescription className="text-xs">
              Candidate volume and procedure value across active clinical stages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stageBreakdown).map(([stKey, data]) => {
              const countPct = totalCount > 0 ? (data.count / totalCount) * 100 : 0
              return (
                <div key={stKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-semibold text-foreground">
                      {data.label} ({data.count})
                    </span>
                    <span className="font-mono text-muted-foreground">
                      ₹{data.value.toLocaleString("en-IN")} · {Math.round(countPct)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${data.color} rounded-full transition-all duration-500`}
                      style={{ width: `${countPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Treatment Category Split */}
        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Procedure Category Distribution</CardTitle>
            <CardDescription className="text-xs">
              Gross pipeline split across Hair Restoration, Transplants, and Skin Transformations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryBreakdown).map(([catKey, data]) => {
              const countPct = totalCount > 0 ? (data.count / totalCount) * 100 : 0
              return (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-semibold text-foreground">
                      {data.label} ({data.count})
                    </span>
                    <span className="font-mono text-muted-foreground">
                      ₹{data.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${data.color} rounded-full transition-all duration-500`}
                      style={{ width: `${countPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
