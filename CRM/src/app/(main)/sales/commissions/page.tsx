import { getCommissions } from "@/actions/commissions"
import { getAllStaff } from "@/lib/auth"
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
import { AddCommissionDialog } from "@/components/commissions/add-commission-dialog"
import { CommissionActions } from "@/components/commissions/commission-actions"
import { formatCurrency, formatDate } from "@/lib/format"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  APPROVED: "secondary",
  PAID: "default",
  REJECTED: "destructive",
}

export default async function CommissionsPage() {
  const [commissions, staff] = await Promise.all([getCommissions(), getAllStaff()])
  const totalPending = commissions.filter((c) => c.status === "PENDING" || c.status === "APPROVED").reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Commissions</h1>
          <p className="text-sm text-muted-foreground">Commission earned per sales rep, with approval and payout tracking.</p>
        </div>
        <AddCommissionDialog staff={staff.map((s) => ({ id: s.id, name: s.name, role: s.role }))} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Pending + approved (not yet paid)</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {commissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No commissions logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Sale Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.user.name}</TableCell>
                    <TableCell>{formatCurrency(Number(c.saleAmount))}</TableCell>
                    <TableCell>{c.ratePercent != null ? `${Number(c.ratePercent)}%` : "—"}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(c.amount))}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell><Badge variant={statusVariant[c.status] ?? "outline"}>{c.status}</Badge></TableCell>
                    <TableCell><CommissionActions id={c.id} status={c.status} /></TableCell>
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
