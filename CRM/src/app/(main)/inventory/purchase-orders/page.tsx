import Link from "next/link"
import { getPurchaseOrders, getSuppliers } from "@/actions/purchase-orders"
import { getInventoryItems } from "@/actions/inventory"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreatePODialog } from "@/components/purchase-orders/create-po-dialog"
import { formatDate } from "@/lib/format"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  ORDERED: "secondary",
  PARTIALLY_RECEIVED: "secondary",
  RECEIVED: "default",
  CANCELLED: "destructive",
}

export default async function PurchaseOrdersPage() {
  const [orders, suppliers, items] = await Promise.all([getPurchaseOrders(), getSuppliers(true), getInventoryItems()])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Reorder from suppliers and receive stock directly into inventory.</p>
        </div>
        <CreatePODialog suppliers={suppliers} items={items} />
      </div>

      <Card>
        <CardContent className="pt-6">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No purchase orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/inventory/purchase-orders/${o.id}`} className="text-primary hover:underline">
                        {o.poNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{o.supplier.name}</TableCell>
                    <TableCell>{o.items.length} item(s)</TableCell>
                    <TableCell>{o.orderedAt ? formatDate(o.orderedAt) : "—"}</TableCell>
                    <TableCell><Badge variant={statusVariant[o.status] ?? "outline"}>{o.status.replace("_", " ")}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
