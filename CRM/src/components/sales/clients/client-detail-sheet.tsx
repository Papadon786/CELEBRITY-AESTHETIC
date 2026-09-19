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
  ShieldAlert,
  Trash2,
  User,
  UserCheck,
  Briefcase,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Crown,
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
  updateClientRenewalStage,
  updateClientStatus,
  deleteClient,
  convertClientToPatient,
} from "@/actions/clients"
import type { ClientStatus, RenewalStage } from "@/types/database"

export function ClientDetailSheet({
  client,
  open,
  onOpenChange,
  onStageChange,
  onStatusChange,
}: {
  client: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStageChange?: (id: string, stage: RenewalStage) => void
  onStatusChange?: (id: string, status: ClientStatus) => void
}) {
  const [isPending, startTransition] = useTransition()

  if (!client) return null

  function handleRenewalStageSelect(newStage: RenewalStage) {
    startTransition(async () => {
      try {
        const res = await updateClientRenewalStage(client.id, newStage)
        if (res.success) {
          toast.success(`Renewal stage updated to ${newStage.replace("_", " ")}`)
          onStageChange?.(client.id, newStage)
        } else {
          toast.error(res.error || "Failed to update renewal stage")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update renewal stage")
      }
    })
  }

  function handleStatusSelect(newStatus: ClientStatus) {
    startTransition(async () => {
      try {
        const res = await updateClientStatus(client.id, newStatus)
        if (res.success) {
          toast.success(`Client status updated to ${newStatus}`)
          onStatusChange?.(client.id, newStatus)
        } else {
          toast.error(res.error || "Failed to update status")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update status")
      }
    })
  }

  function handleConvertToPatient() {
    startTransition(async () => {
      try {
        const res = await convertClientToPatient(client.id)
        if (res.success) {
          toast.success(`Patient record generated with UHID: ${res.uhid}`)
          onOpenChange(false)
        } else {
          toast.error(res.error || "Failed to link patient")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to link patient")
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to remove client account "${client.name}"?`)) return
    startTransition(async () => {
      try {
        const res = await deleteClient(client.id)
        if (res.success) {
          toast.success("Client account removed")
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
                <SheetTitle className="text-xl font-bold">{client.name}</SheetTitle>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {client.status} ({client.healthScore || 50})
                  </span>
                </span>
              </div>
              <SheetDescription className="text-xs font-medium text-foreground/80 flex items-center gap-1.5 mt-1">
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                <span>{client.membershipTier || client.company || "Celebrity VIP Retainer"}</span>
              </SheetDescription>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Annual Retainer</span>
              <span className="text-lg font-bold text-foreground font-mono">
                ₹{Number(client.contractValue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-5">
          {/* Account Status & Renewal Management Card */}
          <div className="rounded-xl border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Retainer & Booster Schedule
              </span>
              <Badge variant="outline" className="text-xs font-mono font-bold">
                Health: {client.healthScore || 50}/100
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Renewal Stage</span>
                <Select
                  value={client.renewalStage}
                  onValueChange={(val) => handleRenewalStageSelect(val as RenewalStage)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9 font-medium text-xs">
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
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Account Status</span>
                <Select
                  value={client.status}
                  onValueChange={(val) => handleStatusSelect(val as ClientStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9 font-medium text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active Retainer</SelectItem>
                    <SelectItem value="AT_RISK">Due for Booster</SelectItem>
                    <SelectItem value="CHURNED">Churned</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Convert to Patient Button */}
            <div className="pt-2">
              <Button
                onClick={handleConvertToPatient}
                disabled={isPending || !!client.patientId}
                className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs h-9 shadow-xs"
              >
                <UserCheck className="h-4 w-4" />
                <span>
                  {client.patientId
                    ? `Linked Patient Profile (${client.patient?.uhid || "Active"})`
                    : "Register as Clinic Patient (UHID)"}
                </span>
              </Button>
            </div>
          </div>

          {/* Clinical Membership Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Clinical Retainer Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Aesthetic Coordinator</p>
                  <p className="font-medium text-xs truncate">
                    {client.accountManagerName || client.accountManager?.name || "Dr. Naziya Baig"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Booster / Touch-up Date</p>
                  <p className="font-medium text-xs truncate">
                    {client.renewalDate
                      ? new Date(client.renewalDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20 sm:col-span-2">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Treatment Focus</p>
                  <p className="font-medium text-xs">
                    {client.treatmentFocus || "Trichology & Cosmetology Transformation"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Booster Frequency</p>
                  <p className="font-medium text-xs truncate">
                    {client.boosterFrequency || "Quarterly"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground font-semibold">Phone</p>
                  <p className="font-medium text-xs truncate">
                    {client.phone || "No phone recorded"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Membership Terms & Protocol History
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                {client.notes}
              </p>
            </div>
          )}

          {/* Activity Log */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account Activity History
            </h4>
            {client.activities && client.activities.length > 0 ? (
              <div className="space-y-2">
                {client.activities.map((act: any) => (
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
              <span>Remove Account</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
