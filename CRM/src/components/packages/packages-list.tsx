"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import { toggleTreatmentPackageActive, type listTreatmentPackages } from "@/actions/packages"

type Packages = Awaited<ReturnType<typeof listTreatmentPackages>>

export function PackagesList({ packages }: { packages: Packages }) {
  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No treatment packages yet. Add session-based bundles like a 6-session FUE course or a laser hair removal package.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((p) => (
        <PackageCard key={p.id} pkg={p} />
      ))}
    </div>
  )
}

function PackageCard({ pkg }: { pkg: Packages[number] }) {
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{pkg.name}</p>
          <Badge variant={pkg.active ? "default" : "secondary"}>{pkg.active ? "Active" : "Inactive"}</Badge>
        </div>
        {pkg.service && <p className="text-xs text-muted-foreground">Linked to {pkg.service.name}</p>}
        <p className="text-lg font-semibold mt-1">{formatCurrency(Number(pkg.price))}</p>
        <p className="text-xs text-muted-foreground mt-1">{pkg.totalSessions} sessions{pkg.validityDays ? ` · valid ${pkg.validityDays} days` : ""}</p>
        {pkg.description && <p className="text-xs text-muted-foreground mt-2">{pkg.description}</p>}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await toggleTreatmentPackageActive(pkg.id, !pkg.active)
                } catch {
                  toast.error("Could not update package")
                }
              })
            }
          >
            {pkg.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
