import Link from "next/link"
import { getOverdueInstallments } from "@/actions/payment-plans"
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
import { formatCurrency, formatDate, patientDisplayName } from "@/lib/format"

export default async function InstallmentsPage() {
  const overdue = await getOverdueInstallments()
  const totalOverdue = overdue.reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overdue EMI Installments</h1>
        <p className="text-sm text-muted-foreground">
          Patients on a No Cost EMI plan with a payment due date that has already passed.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total overdue</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {overdue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No overdue installments — all EMI plans are on schedule.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{patientDisplayName(i.paymentPlan.patient)}</TableCell>
                    <TableCell>#{i.installmentNumber} of {i.paymentPlan.numberOfInstallments}</TableCell>
                    <TableCell><Badge variant="destructive">{formatDate(i.dueDate)}</Badge></TableCell>
                    <TableCell>{formatCurrency(Number(i.amount))}</TableCell>
                    <TableCell>
                      <Link href={`/billing/${i.paymentPlan.billId}`} className="text-primary hover:underline">
                        {i.paymentPlan.bill.billNumber}
                      </Link>
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
