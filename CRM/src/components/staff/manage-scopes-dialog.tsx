"use client"

import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import {
  Shield,
  Layers,
  Lock,
  CheckSquare,
  Square,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateStaffPermissions } from "@/actions/staff"
import {
  ALL_AVAILABLE_TABS,
  ALL_ACTION_SCOPES,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_DOCTOR_PERMISSIONS,
  DEFAULT_RECEPTIONIST_PERMISSIONS,
  getEffectivePermissions,
  type StaffPermissions,
} from "@/lib/permissions"
import type { StaffRole } from "@/types/database"

type StaffMember = {
  id: string
  name: string
  email: string
  role: StaffRole
  permissions?: any
}

export function ManageScopesDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: StaffMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [allowedTabs, setAllowedTabs] = useState<string[]>([])
  const [actionScopes, setActionScopes] = useState<Record<string, boolean>>({})
  const [pending, startTransition] = useTransition()

  // Initialize permissions when staff changes
  useEffect(() => {
    if (staff) {
      const effective = getEffectivePermissions(staff)
      setAllowedTabs(effective.allowedTabs)
      setActionScopes(effective.actionScopes)
    }
  }, [staff])

  if (!staff) return null

  const isStaffAdmin = staff.role === "ADMIN"

  function toggleTab(href: string) {
    setAllowedTabs((prev) =>
      prev.includes(href) ? prev.filter((t) => t !== href) : [...prev, href]
    )
  }

  function toggleGroupTabs(group: string) {
    const groupTabs = ALL_AVAILABLE_TABS.filter((t) => t.group === group).map((t) => t.href)
    const allSelected = groupTabs.every((href) => allowedTabs.includes(href))

    if (allSelected) {
      setAllowedTabs((prev) => prev.filter((href) => !groupTabs.includes(href)))
    } else {
      setAllowedTabs((prev) => Array.from(new Set([...prev, ...groupTabs])))
    }
  }

  function toggleActionScope(key: string, val: boolean) {
    setActionScopes((prev) => ({ ...prev, [key]: val }))
  }

  function applyPreset(preset: StaffPermissions) {
    setAllowedTabs(preset.allowedTabs)
    setActionScopes(preset.actionScopes)
    toast.success("Applied preset template")
  }

  async function handleSave() {
    if (!staff) return

    startTransition(async () => {
      try {
        await updateStaffPermissions(staff.id, {
          allowedTabs,
          actionScopes,
        })
        toast.success(`Updated permission scopes and tab access for ${staff.name}`)
        onOpenChange(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to save permissions")
      }
    })
  }

  const groups: ("Care" | "Clinical" | "Sales" | "Billing & Finance" | "Website" | "Calendar")[] = [
    "Care",
    "Clinical",
    "Sales",
    "Billing & Finance",
    "Website",
    "Calendar",
  ]

  const actionCategories: ("Appointments" | "Medicines & Inventory" | "Sales & Leads" | "Billing & Cash" | "Patient Data & Exports")[] = [
    "Appointments",
    "Medicines & Inventory",
    "Sales & Leads",
    "Billing & Cash",
    "Patient Data & Exports",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Manage Scopes & Tab Access: <span className="text-primary">{staff.name}</span>
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              {staff.role}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure selective CRM navigation tab visibility and operational action privileges.
          </DialogDescription>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Presets:
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-[11px] h-6"
              onClick={() =>
                applyPreset(
                  staff.role === "DOCTOR"
                    ? DEFAULT_DOCTOR_PERMISSIONS
                    : staff.role === "ADMIN"
                    ? DEFAULT_ADMIN_PERMISSIONS
                    : DEFAULT_RECEPTIONIST_PERMISSIONS
                )
              }
            >
              Default Role Preset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-[11px] h-6 text-blue-600 dark:text-blue-400"
              onClick={() => applyPreset(DEFAULT_RECEPTIONIST_PERMISSIONS)}
            >
              Front Desk Zero-Trust
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-[11px] h-6 text-purple-600 dark:text-purple-400"
              onClick={() => applyPreset(DEFAULT_ADMIN_PERMISSIONS)}
            >
              Full Access (All Tabs)
            </Button>
          </div>
        </DialogHeader>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Navigation Tabs Visibility */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Allowed Navigation Tabs ({allowedTabs.length} of {ALL_AVAILABLE_TABS.length} enabled)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tabs checked here will appear in the staff member&apos;s sidebar navigation and mobile menu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => {
                const groupTabs = ALL_AVAILABLE_TABS.filter((t) => t.group === group)
                const allSelected = groupTabs.every((t) => allowedTabs.includes(t.href))

                return (
                  <div key={group} className="rounded-xl border bg-muted/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="font-semibold text-xs text-foreground uppercase tracking-wide">{group}</p>
                      <button
                        type="button"
                        onClick={() => toggleGroupTabs(group)}
                        className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        {allSelected ? <Square className="h-3 w-3" /> : <CheckSquare className="h-3 w-3" />}
                        {allSelected ? "Deselect Group" : "Select Group"}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {groupTabs.map((tab) => {
                        const isChecked = allowedTabs.includes(tab.href)

                        return (
                          <label
                            key={tab.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                              isChecked
                                ? "bg-card border-primary/40 shadow-xs text-foreground"
                                : "bg-muted/40 border-transparent text-muted-foreground opacity-75 hover:opacity-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTab(tab.href)}
                              className="mt-0.5 rounded border-muted-foreground/30 text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold">{tab.label}</span>
                                <span className="font-mono text-[10px] text-muted-foreground">{tab.href}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{tab.description}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Granular Action Scopes */}
          <div className="space-y-4 pt-2 border-t">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Operational Action Scopes & Guardrails
              </h3>
              <p className="text-xs text-muted-foreground">
                Fine-tune exactly what this staff member is allowed to create, modify, or view within their enabled tabs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionCategories.map((category) => {
                const scopes = ALL_ACTION_SCOPES.filter((s) => s.category === category)

                return (
                  <div key={category} className="rounded-xl border bg-muted/20 p-3.5 space-y-3">
                    <p className="font-semibold text-xs text-foreground uppercase tracking-wide border-b pb-1.5">
                      {category}
                    </p>

                    <div className="space-y-2.5">
                      {scopes.map((scope) => {
                        const enabled = !!actionScopes[scope.key]

                        return (
                          <div
                            key={scope.key}
                            className="flex items-start justify-between gap-3 p-2 rounded-lg bg-card border shadow-xs text-xs"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                {scope.label}
                                {enabled ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                ) : null}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{scope.description}</p>
                            </div>

                            <Switch
                              checked={enabled}
                              onCheckedChange={(val) => toggleActionScope(scope.key, val)}
                              className="shrink-0"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Changes will take effect immediately across all sessions for <span className="font-semibold text-foreground">{staff.name}</span>.
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={handleSave}
              className="gap-1.5 font-semibold"
            >
              <Save className="h-4 w-4" />
              {pending ? "Saving…" : "Save Scopes & Access"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
