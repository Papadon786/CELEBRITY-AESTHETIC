"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AssignPackageDialog } from "./assign-package-dialog"
import { usePackageSession, cancelPatientPackage } from "@/actions/packages"
import { formatDate } from "@/lib/format"
import type { getPatientPackages, listTreatmentPackages } from "@/actions/packages"

type PatientPackages = Awaited<ReturnType<typeof getPatientPackages>>
type Catalog = Awaited<ReturnType<typeof listTreatmentPackages>>

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  COMPLETED: "secondary",
  EXPIRED: "destructive",
  CANCELLED: "outline",
}

export function PatientPackagesTab({
  patientId,
  packages,
  catalog,
}: {
  patientId: string
  packages: PatientPackages
  catalog: Catalog
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Session-based packages this patient has purchased, with sessions remaining.
        </p>
        <AssignPackageDialog patientId={patientId} packages={catalog} />
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No packages assigned yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {packages.map((pp) => (
            <PatientPackageCard key={pp.id} patientPackage={pp} />
          ))}
        </div>
      )}
    </div>
  )
}

function PatientPackageCard({ patientPackage: pp }: { patientPackage: PatientPackages[number] }) {
  const [pending, startTransition] = useTransition()
  const remaining = pp.sessionsTotal - pp.sessionsUsed
  const percent = pp.sessionsTotal > 0 ? Math.round((pp.sessionsUsed / pp.sessionsTotal) * 100) : 0

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{pp.package.name}</p>
          <Badge variant={statusVariant[pp.status] ?? "outline"}>{pp.status}</Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {pp.sessionsUsed} of {pp.sessionsTotal} sessions used
            </span>
            <span>{remaining} remaining</span>
          </div>
          <Progress value={percent} />
        </div>

        <p className="text-xs text-muted-foreground">
          Purchased {formatDate(pp.purchasedAt)}
          {pp.expiresAt ? ` · expires ${formatDate(pp.expiresAt)}` : ""}
        </p>

        {pp.status === "ACTIVE" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await usePackageSession({ patientPackageId: pp.id })
                    toast.success("Session recorded")
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not record session")
                  }
                })
              }
            >
              Use a Session
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await cancelPatientPackage(pp.id)
                    toast.success("Package cancelled")
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not cancel package")
                  }
                })
              }
            >
              Cancel
            </Button>
          </div>
        )}

        {pp.sessionLogs.length > 0 && (
          <div className="pt-2 border-t space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Session history</p>
            {pp.sessionLogs.map((log) => (
              <p key={log.id} className="text-xs text-muted-foreground">
                {formatDate(log.usedAt)}
                {log.performedBy ? ` · ${log.performedBy.name}` : ""}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
