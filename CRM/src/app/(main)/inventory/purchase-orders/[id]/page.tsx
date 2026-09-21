import { notFound } from "next/navigation"
import { getPurchaseOrder } from "@/actions/purchase-orders"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReceivePOForm } from "@/components/purchase-orders/receive-po-form"
import { formatDate, formatCurrency } from "@/lib/format"

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const po = await getPurchaseOrder(id)
  if (!po) notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{po.poNumber}</h1>
          <p className="text-sm text-muted-foreground">{po.supplier.name}</p>
        </div>
        <Badge>{po.status.replace("_", " ")}</Badge>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <p>Ordered: {po.orderedAt ? formatDate(po.orderedAt) : "—"}</p>
          {po.expectedAt && <p>Expected: {formatDate(po.expectedAt)}</p>}
          {po.receivedAt && <p>Received: {formatDate(po.receivedAt)}</p>}
          {po.notes && <p className="text-muted-foreground">{po.notes}</p>}
          <div className="pt-2 space-y-1">
            {po.items.map((i: any) => (
              <p key={i.id}>
                {i.inventoryItem.name} — {i.quantityReceived}/{i.quantityOrdered} received
                {i.unitCost != null ? ` @ ${formatCurrency(Number(i.unitCost))}` : ""}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ReceivePOForm po={po} />
        </CardContent>
      </Card>
    </div>
  )
}
