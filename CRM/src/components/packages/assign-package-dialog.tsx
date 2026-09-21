"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignPackageToPatient } from "@/actions/packages"
import type { listTreatmentPackages } from "@/actions/packages"
import { formatCurrency } from "@/lib/format"

export function AssignPackageDialog({
  patientId,
  packages,
}: {
  patientId: string
  packages: Awaited<ReturnType<typeof listTreatmentPackages>>
}) {
  const [open, setOpen] = useState(false)
  const [packageId, setPackageId] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const activePackages = packages.filter((p) => p.active)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Assign Package
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Treatment Package</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!packageId) {
              toast.error("Select a package")
              return
            }
            startTransition(async () => {
              try {
                await assignPackageToPatient({ patientId, packageId })
                toast.success("Package assigned")
                setOpen(false)
                setPackageId("")
                router.refresh()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not assign package")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="assign-pkg">Package</Label>
            <Select value={packageId} onValueChange={(v) => setPackageId(v ?? "")}>
              <SelectTrigger id="assign-pkg">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {activePackages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.totalSessions} sessions — {formatCurrency(Number(p.price))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activePackages.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No active packages in the catalog yet — add one under Sales → Treatment Packages first.
              </p>
            )}
          </div>
          <Button type="submit" disabled={pending || !packageId} className="w-full">
            {pending ? "Assigning…" : "Assign Package"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
