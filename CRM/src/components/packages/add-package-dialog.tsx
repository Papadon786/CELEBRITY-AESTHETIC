"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTreatmentPackage } from "@/actions/packages"
import type { getServices } from "@/actions/services"

export function AddPackageDialog({ services }: { services: Awaited<ReturnType<typeof getServices>> }) {
  const [open, setOpen] = useState(false)
  const [serviceId, setServiceId] = useState<string>("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Package
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Treatment Package</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startTransition(async () => {
              try {
                await createTreatmentPackage({
                  name: String(fd.get("name") || ""),
                  description: String(fd.get("description") || "") || undefined,
                  serviceId: serviceId || undefined,
                  totalSessions: Number(fd.get("totalSessions") || 1),
                  price: Number(fd.get("price") || 0),
                  validityDays: fd.get("validityDays") ? Number(fd.get("validityDays")) : undefined,
                })
                toast.success("Package created")
                setOpen(false)
                setServiceId("")
                router.refresh()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not create package")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="pkg-name">Package name</Label>
            <Input id="pkg-name" name="name" required placeholder="e.g. FUE Hair Transplant — 6 Sessions" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-service">Linked service (optional)</Label>
            <Select value={serviceId} onValueChange={(v) => setServiceId(v ?? "")}>
              <SelectTrigger id="pkg-service">
                <SelectValue placeholder="No linked service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-description">Description</Label>
            <Textarea id="pkg-description" name="description" placeholder="What this package covers" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-sessions">Sessions</Label>
              <Input id="pkg-sessions" name="totalSessions" type="number" min={1} defaultValue={1} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price">Price (₹)</Label>
              <Input id="pkg-price" name="price" type="number" min={0} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-validity">Validity (days)</Label>
              <Input id="pkg-validity" name="validityDays" type="number" min={1} placeholder="Optional" />
            </div>
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Create Package"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
