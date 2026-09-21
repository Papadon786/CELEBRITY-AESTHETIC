import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getExpiringBatches } from "@/actions/inventory"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"

export default async function ExpiringInventoryPage() {
  const batches = await getExpiringBatches(30)
  const expired = batches.filter((b) => b.isExpired)
  const expiringSoon = batches.filter((b) => !b.isExpired)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          nativeButton={false}
          render={
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Link>
          }
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expiring & Expired Stock</h1>
          <p className="text-sm text-muted-foreground">
            Tracked batches (PRP kits, botox, fillers, etc.) that have expired or expire within 30 days. Stock-out
            already refuses to dispense from expired batches.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No batches expiring soon.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Remaining Qty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...expired, ...expiringSoon].map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.item.name}</TableCell>
                    <TableCell>{b.batchNumber || "—"}</TableCell>
                    <TableCell>{formatDate(b.expiryDate)}</TableCell>
                    <TableCell>{b.quantityRemaining} {b.item.unit}(s)</TableCell>
                    <TableCell>
                      <Badge variant={b.isExpired ? "destructive" : "secondary"}>
                        {b.isExpired ? "Expired" : "Expiring Soon"}
                      </Badge>
                    </TableCell>
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
