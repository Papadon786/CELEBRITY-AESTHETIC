"use client"

import { useState, useTransition } from "react"
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  Mail,
  Phone,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  User,
  Briefcase,
  AlertTriangle,
  Stethoscope,
  Scissors,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  updateProspectStage,
  deleteProspect,
  convertProspectToClient,
} from "@/actions/prospects"
import type { ProspectStage } from "@/types/database"

const STAGE_CONFIG: Record<
  ProspectStage,
  { label: string; color: string; bg: string }
> = {
  QUALIFIED: { label: "Consultation Inquiry", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/10 border-amber-500/20" },
  DEMO_BOOKED: { label: "Scalp / Skin Analysis", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-500/10 border-blue-500/20" },
  PROPOSAL_SENT: { label: "Treatment Plan Sent", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-500/10 border-purple-500/20" },
  NEGOTIATION: { label: "Treatment Negotiation", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CLOSED_WON: { label: "Procedure Booked", color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-500/10 border-teal-500/20" },
  CLOSED_LOST: { label: "Postponed / Lost", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-500/10 border-rose-500/20" },
}

export function ProspectDetailSheet({
  prospect,
  open,
  onOpenChange,
  onStageChange,
}: {
  prospect: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStageChange?: (id: string, stage: ProspectStage) => void
}) {
  const [isPending, startTransition] = useTransition()

  if (!prospect) return null

  const stageCfg = STAGE_CONFIG[prospect.stage as ProspectStage] || STAGE_CONFIG.QUALIFIED

  function handleStageSelect(newStage: ProspectStage) {
    startTransition(async () => {
      try {
        const res = await updateProspectStage(prospect.id, newStage)
        if (res.success) {
          toast.success(`Stage updated to ${STAGE_CONFIG[newStage]?.label || newStage}`)
          onStageChange?.(prospect.id, newStage)
        } else {
          toast.error(res.error || "Failed to update stage")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update stage")
      }
    })
  }

  function handleConvertToClient() {
    startTransition(async () => {
      try {
        const res = await convertProspectToClient(prospect.id)
        if (res.success) {
          toast.success(`Candidate "${prospect.name}" converted to VIP Aesthetic Client Retainer!`)
          onOpenChange(false)
        } else {
          toast.error(res.error || "Conversion failed")
        }
      } catch (err: any) {
        toast.error(err.message || "Conversion failed")
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to remove candidate "${prospect.name}" from pipeline?`)) return
    startTransition(async () => {
      try {
        const res = await deleteProspect(prospect.id)
        if (res.success) {
          toast.success("Candidate removed from pipeline")
          onOpenChange(false)
        } else {
          toast.error(res.error || "Delete failed")
        }
      } catch (err: any) {
        toast.error(err.message || "Delete failed")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader className="space-y-2 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-bold">{prospect.name}</SheetTitle>
                <Badge className={`${stageCfg.bg} ${stageCfg.color} border text-xs font-semibold`}>
                  {stageCfg.label}
                </Badge>
              </div>
              <SheetDescription className="text-xs font-medium text-foreground/80 flex items-center gap-1.5 mt-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{prospect.treatmentInterest || prospect.company || "Aesthetic Assessment"}</span>
              </SheetDescription>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Procedure Quote</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{Number(prospect.value || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-5">
          {/* Quick Actions & Convert to Client */}
          <div className="rounded-xl border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Clinical Progression
              </span>
              <Badge variant="outline" className="text-xs font-mono font-bold text-amber-600">
                Candidacy: {prospect.icpScore}/10
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Consultation Stage</span>
                <Select
                  value={prospect.stage}
                  onValueChange={(val) => handleStageSelect(val as ProspectStage)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9 font-medium text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUALIFIED">Inquiry</SelectItem>
                    <SelectItem value="DEMO_BOOKED">Scalp / Skin Analysis</SelectItem>
                    <SelectItem value="PROPOSAL_SENT">Treatment Plan Sent</SelectItem>
                    <SelectItem value="NEGOTIATION">Treatment Negotiation</SelectItem>
                    <SelectItem value="CLOSED_WON">Procedure Booked</SelectItem>
                    <SelectItem value="CLOSED_LOST">Postponed / Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleConvertToClient}
                  disabled={isPending}
                  className="w-full h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Activate Retainer</span>
                </Button>
              </div>
            </div>

            {/* Patient Readiness Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Patient Readiness Score</span>
                <span className="font-bold text-primary">{prospect.engagement || 25}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, prospect.engagement || 25)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clinical Profile & Concern */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Clinical Assessment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Specialist Doctor</p>
                  <p className="font-medium text-xs truncate">
                    {prospect.doctorPreference || "Dr. Naziya Baig"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Target Procedure Date</p>
                  <p className="font-medium text-xs truncate">
                    {prospect.dueDate
                      ? new Date(prospect.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Flexible"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20 sm:col-span-2">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Diagnosis / Concern</p>
                  <p className="font-medium text-xs">
                    {prospect.candidateConcern || "Candidate seeking clinical evaluation"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Email</p>
                  <p className="font-medium text-xs truncate">
                    {prospect.email || "No email recorded"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Phone</p>
                  <p className="font-medium text-xs truncate">
                    {prospect.phone || "No phone recorded"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {prospect.notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Diagnostic & Follow-up Notes
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                {prospect.notes}
              </p>
            </div>
          )}

          {/* Activity Log */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Clinical Pipeline History
            </h4>
            {prospect.activities && prospect.activities.length > 0 ? (
              <div className="space-y-2">
                {prospect.activities.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg border bg-card text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-medium text-foreground">{act.title}</span>
                      <span className="text-[10px]">
                        {new Date(act.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {act.details && (
                      <p className="text-muted-foreground text-[11px]">{act.details}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No activities logged yet.</p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove Candidate</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
