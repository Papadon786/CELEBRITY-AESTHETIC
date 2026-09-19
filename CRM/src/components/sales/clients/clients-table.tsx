"use client"

import { useState } from "react"
import {
  Building2,
  Calendar,
  Eye,
  IndianRupee,
  Mail,
  Phone,
  UserCheck,
  ChevronDown,
  Sparkles,
  Stethoscope,
} from "lucide-react"
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
import type { ClientStatus, RenewalStage } from "@/types/database"

export interface TableClient {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: ClientStatus
  healthScore: number
  accountManagerName: string | null
  accountManager?: { id: string; name: string } | null
  contractValue: number
  renewalDate: string | null
  renewalStage: RenewalStage
  notes: string | null
  membershipTier?: string | null
  treatmentFocus?: string | null
  boosterFrequency?: string | null
  patientId: string | null
  isOverdue?: boolean
  daysDifference?: number | null
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "AC"
  const clean = name.replace(/^(Dr\.?|Mr\.?|Ms\.?)\s+/i, "").trim()
  const parts = clean.split(" ")
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getTreatmentFocusBadge(focus: string | null | undefined) {
  if (!focus) {
    return { label: "Aesthetic Retainer", color: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200" }
  }
  const f = focus.toLowerCase()
  if (f.includes("hair") || f.includes("tricho")) {
    return { label: "Trichology (Hair)", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200" }
  }
  if (f.includes("skin") || f.includes("peel") || f.includes("facial")) {
    return { label: "Skin & Medi-Facials", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200" }
  }
  if (f.includes("aging") || f.includes("botox") || f.includes("filler")) {
    return { label: "Anti-Aging Aesthetics", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200" }
  }
  if (f.includes("bridal")) {
    return { label: "Bridal Concierge", color: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200" }
  }
  return { label: focus, color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200" }
}

export function ClientsTable({
  clients,
  onSelectClient,
  onRenewalStageChange,
  onConvertToPatient,
}: {
  clients: TableClient[]
  onSelectClient: (client: TableClient) => void
  onRenewalStageChange: (id: string, stage: RenewalStage) => void
  onConvertToPatient: (client: TableClient) => void
}) {
  const now = new Date()

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/30 text-muted-foreground font-semibold border-b">
            <tr>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                CLIENT & VIP MEMBERSHIP
              </th>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                TREATMENT FOCUS
              </th>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                SKIN & HAIR HEALTH
              </th>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                AESTHETIC COORDINATOR
              </th>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                ANNUAL VALUE
              </th>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                BOOSTER / RENEWAL
              </th>
              <th className="py-3 px-4 font-semibold text-muted-foreground tracking-wider uppercase text-[11px]">
                RENEWAL STAGE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                  No aesthetic client accounts found for this filter.
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const managerName =
                  client.accountManagerName || client.accountManager?.name || "Bhumika R"
                const managerInitials = getInitials(managerName)
                const focusBadge = getTreatmentFocusBadge(client.treatmentFocus || client.company)

                // Compute renewal / booster display
                let renewalDateStr = "—"
                let renewalSubStr: React.ReactNode = null

                if (client.renewalDate) {
                  const d = new Date(client.renewalDate)
                  renewalDateStr = d.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })

                  const diffDays = Math.round(
                    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  )

                  if (
                    diffDays < 0 &&
                    client.renewalStage !== "CONFIRMED" &&
                    client.renewalStage !== "COMPLETED"
                  ) {
                    renewalSubStr = (
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
                        {Math.abs(diffDays)}d overdue
                      </span>
                    )
                  } else if (diffDays >= 0) {
                    renewalSubStr = (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                        {diffDays}d
                      </span>
                    )
                  }
                }

                // Health styling
                let healthBg = "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40"
                let healthDot = "bg-emerald-500"

                if (client.status === "AT_RISK") {
                  healthBg = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200"
                  healthDot = "bg-amber-500"
                } else if (client.status === "CHURNED") {
                  healthBg = "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200"
                  healthDot = "bg-rose-500"
                } else if (client.status === "PAUSED") {
                  healthBg = "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200"
                  healthDot = "bg-slate-400"
                }

                const isConfirmed = client.renewalStage === "CONFIRMED" || client.renewalStage === "COMPLETED"

                return (
                  <tr
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    {/* CLIENT & MEMBERSHIP */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground hover:text-primary transition-colors text-sm">
                        {client.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
                        {client.membershipTier || client.company || "Celebrity VIP Retainer"}
                      </div>
                    </td>

                    {/* TREATMENT FOCUS */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold",
                          focusBadge.color
                        )}
                      >
                        {focusBadge.label}
                      </span>
                    </td>

                    {/* HEALTH */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                          healthBg
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", healthDot)} />
                        <span>
                          {client.status.charAt(0) + client.status.slice(1).toLowerCase()} (
                          {client.healthScore || 50})
                        </span>
                      </span>
                    </td>

                    {/* AESTHETIC COORDINATOR */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black font-bold text-[11px] flex items-center justify-center shrink-0 tracking-wider">
                          {managerInitials}
                        </div>
                        <span className="font-medium text-foreground text-xs">
                          {managerName}
                        </span>
                      </div>
                    </td>

                    {/* ANNUAL VALUE */}
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground text-xs">
                      ₹{client.contractValue ? client.contractValue.toLocaleString("en-IN") : "0"}
                    </td>

                    {/* BOOSTER / RENEWAL */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="text-foreground font-medium">{renewalDateStr}</span>
                      {renewalSubStr}
                    </td>

                    {/* RENEWAL STAGE */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={client.renewalStage}
                        onValueChange={(val) => onRenewalStageChange(client.id, val as RenewalStage)}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 text-xs font-semibold border-none px-3 rounded-md w-[125px] transition-colors",
                            isConfirmed
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted font-medium"
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                          <SelectItem value="IN_DISCUSSION">Session Scheduled</SelectItem>
                          <SelectItem value="PROPOSAL_SENT">Booster Sent</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
