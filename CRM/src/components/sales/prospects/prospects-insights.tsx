"use client"

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Lightbulb,
  PhoneCall,
  Sparkles,
  Zap,
  Stethoscope,
  Scissors,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProspectStage } from "@/types/database"

interface InsightProspect {
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
  treatmentCategory?: string | null
  treatmentInterest?: string | null
  candidateConcern?: string | null
  doctorPreference?: string | null
}

export function ProspectsInsights({
  prospects,
  onSelectProspect,
}: {
  prospects: InsightProspect[]
  onSelectProspect: (prospect: InsightProspect) => void
}) {
  const now = new Date()

  // Find overdue clinical follow-ups
  const overdue = prospects.filter((p) => {
    if (!p.dueDate || p.stage === "CLOSED_WON" || p.stage === "CLOSED_LOST") return false
    return new Date(p.dueDate).getTime() < now.getTime()
  })

  // High readiness / engagement candidates
  const hotLeads = prospects.filter(
    (p) => (p.engagement || 0) >= 30 && (p.stage === "QUALIFIED" || p.stage === "PROPOSAL_SENT")
  )

  // High-ticket procedures in negotiation (Hair transplants / Bridal packages)
  const inNegotiation = prospects.filter((p) => p.stage === "NEGOTIATION")

  return (
    <div className="space-y-5">
      {/* AI Clinical Sales Co-Pilot Banner */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-purple-500/10 p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Clinical Aesthetic Intelligence & Treatment Follow-Ups
              <Badge className="bg-primary/20 text-primary border-none text-[10px]">
                Live Recommendations
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Based on trichoscopy and skin candidacy scores, our clinical pipeline has flagged {overdue.length} overdue consultation follow-ups and {hotLeads.length} high-intent candidates ready for clinical analysis or procedure scheduling.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overdue Consultation Follow-ups */}
        <Card className="rounded-xl border border-red-200/80 dark:border-red-950 bg-card/60 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Overdue Follow-ups ({overdue.length})</span>
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Candidates awaiting post-consultation quotes or date confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {overdue.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                All clinical candidate follow-ups are up to date! 🎉
              </p>
            ) : (
              overdue.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="p-3 rounded-lg border border-red-200/60 bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{p.name}</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold font-mono">
                      ₹{p.value?.toLocaleString("en-IN") || "0"}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/80 font-medium">
                    {p.treatmentInterest || p.candidateConcern || "Aesthetic Inquiry"}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                    <span>Candidacy {p.icpScore}/10</span>
                    <span className="text-red-600 font-medium">Overdue Target Date</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* High Readiness Candidates */}
        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-500">
                <Flame className="h-4 w-4" />
                <span>High Readiness ({hotLeads.length})</span>
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Candidates reviewing treatment plans & comparing procedure slots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {hotLeads.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No high-readiness candidates detected currently.
              </p>
            ) : (
              hotLeads.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{p.name}</span>
                    <span className="text-[10px] text-rose-500 font-bold">
                      {p.engagement}% Readiness
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/80 font-medium">
                    {p.treatmentInterest || "Custom Package"}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-muted-foreground font-mono">
                      ₹{p.value?.toLocaleString("en-IN") || "0"}
                    </span>
                    <span className="text-primary font-semibold">Ready for Slot Booking</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* High-Ticket Treatment Negotiations */}
        <Card className="rounded-xl border bg-card/60 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" />
                <span>In Procedure Negotiation ({inNegotiation.length})</span>
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Transplant & multi-session packages finalizing schedule & payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {inNegotiation.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No candidates currently in procedure negotiation.
              </p>
            ) : (
              inNegotiation.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{p.name}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{p.value?.toLocaleString("en-IN") || "0"}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/80 font-medium">
                    {p.treatmentInterest || "Treatment Package"}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-muted-foreground">Candidacy {p.icpScore}/10</span>
                    <span className="text-emerald-600 font-medium">Ready for Deposit</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
