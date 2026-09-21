"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { receivePurchaseOrder } from "@/actions/purchase-orders"
import type { getPurchaseOrder } from "@/actions/purchase-orders"

type PO = NonNullable<Awaited<ReturnType<typeof getPurchaseOrder>>>

export function ReceivePOForm({ po }: { po: PO }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const [lines, setLines] = useState(
    po.items.map((i) => ({
      purchaseOrderItemId: i.id,
      quantityReceived: Math.max(i.quantityOrdered - i.quantityReceived, 0),
      batchNumber: "",
      expiryDate: "",
    }))
  )

  if (po.status === "RECEIVED" || po.status === "CANCELLED") return null

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Receive Stock</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Ordered</TableHead>
            <TableHead>Already Received</TableHead>
            <TableHead>Receive Now</TableHead>
            <TableHead>Batch #</TableHead>
            <TableHead>Expiry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {po.items.map((item, idx) => (
            <TableRow key={item.id}>
              <TableCell>{item.inventoryItem.name}</TableCell>
              <TableCell>{item.quantityOrdered}</TableCell>
              <TableCell>{item.quantityReceived}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  className="w-20"
                  value={lines[idx].quantityReceived}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, quantityReceived: Number(e.target.value) || 0 } : l))
                    )
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  className="w-28"
                  value={lines[idx].batchNumber}
                  onChange={(e) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, batchNumber: e.target.value } : l)))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  className="w-36"
                  value={lines[idx].expiryDate}
                  onChange={(e) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, expiryDate: e.target.value } : l)))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await receivePurchaseOrder({
                purchaseOrderId: po.id,
                items: lines.map((l) => ({
                  purchaseOrderItemId: l.purchaseOrderItemId,
                  quantityReceived: l.quantityReceived,
                  batchNumber: l.batchNumber || undefined,
                  expiryDate: l.expiryDate ? new Date(l.expiryDate) : undefined,
                })),
              })
              toast.success("Stock received")
              router.refresh()
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not receive stock")
            }
          })
        }
      >
        {pending ? "Receiving…" : "Confirm Receipt"}
      </Button>
    </div>
  )
}
