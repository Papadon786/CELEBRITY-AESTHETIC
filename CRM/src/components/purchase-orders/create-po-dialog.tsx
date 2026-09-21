"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPurchaseOrder } from "@/actions/purchase-orders"
import type { getSuppliers } from "@/actions/purchase-orders"
import type { getInventoryItems } from "@/actions/inventory"

type Supplier = Awaited<ReturnType<typeof getSuppliers>>[number]
type InventoryItem = Awaited<ReturnType<typeof getInventoryItems>>[number]
type Line = { inventoryItemId: string; quantityOrdered: number; unitCost?: number }

export function CreatePODialog({ suppliers, items }: { suppliers: Supplier[]; items: InventoryItem[] }) {
  const [open, setOpen] = useState(false)
  const [supplierId, setSupplierId] = useState("")
  const [lines, setLines] = useState<Line[]>([{ inventoryItemId: "", quantityOrdered: 1 }])
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Purchase Order
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            {lines.map((line, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Select value={line.inventoryItemId} onValueChange={(v) => updateLine(i, { inventoryItemId: v ?? "" })}>
                    <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                    <SelectContent>
                      {items.map((it) => (
                        <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={line.quantityOrdered}
                  onChange={(e) => updateLine(i, { quantityOrdered: Number(e.target.value) || 1 })}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Cost"
                  className="w-24"
                  value={line.unitCost ?? ""}
                  onChange={(e) => updateLine(i, { unitCost: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setLines((prev) => [...prev, { inventoryItemId: "", quantityOrdered: 1 }])}
            >
              + Add Line
            </Button>
          </div>

          <Button
            disabled={pending || !supplierId || lines.some((l) => !l.inventoryItemId)}
            className="w-full"
            onClick={() =>
              startTransition(async () => {
                try {
                  await createPurchaseOrder({ supplierId, items: lines })
                  toast.success("Purchase order created")
                  setOpen(false)
                  setLines([{ inventoryItemId: "", quantityOrdered: 1 }])
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not create purchase order")
                }
              })
            }
          >
            {pending ? "Creating…" : "Create Purchase Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
