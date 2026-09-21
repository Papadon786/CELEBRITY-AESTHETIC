"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Boxes, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getInventoryItems } from "@/actions/inventory"
import { getServiceConsumables, addServiceConsumable, removeServiceConsumable } from "@/actions/service-consumables"

type InventoryItem = Awaited<ReturnType<typeof getInventoryItems>>[number]
type ConsumableLink = Awaited<ReturnType<typeof getServiceConsumables>>[number]

export function ManageConsumablesDialog({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [links, setLinks] = useState<ConsumableLink[]>([])
  const [itemId, setItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    Promise.all([getInventoryItems(), getServiceConsumables(serviceId)]).then(([i, l]) => {
      setItems(i)
      setLinks(l)
    })
  }, [open, serviceId])

  function refresh() {
    getServiceConsumables(serviceId).then(setLinks)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Boxes className="h-3.5 w-3.5" />
        Consumables
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consumables — {serviceName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Stock used automatically whenever an appointment for this service is marked Completed.
          </p>

          {links.length > 0 && (
            <div className="space-y-1.5">
              {links.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>
                    {l.inventoryItem.name} — {l.quantityPerProcedure} {l.inventoryItem.unit}(s) / procedure
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await removeServiceConsumable(l.id)
                          refresh()
                        } catch {
                          toast.error("Could not remove")
                        }
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 pt-2 border-t">
            <div className="flex-1 space-y-1.5">
              <Label>Item</Label>
              <Select value={itemId} onValueChange={(v) => setItemId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 space-y-1.5">
              <Label>Qty</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
            </div>
            <Button
              disabled={pending || !itemId}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await addServiceConsumable({ serviceId, inventoryItemId: itemId, quantityPerProcedure: quantity })
                    setItemId("")
                    setQuantity(1)
                    refresh()
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not add")
                  }
                })
              }
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
