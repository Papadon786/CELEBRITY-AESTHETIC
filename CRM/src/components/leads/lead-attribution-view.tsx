"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { setLeadSourceSpend, type getLeadSourceReport } from "@/actions/lead-attribution"
import { formatCurrency } from "@/lib/format"

type Report = Awaited<ReturnType<typeof getLeadSourceReport>>

export function LeadAttributionView({ report }: { report: Report }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Lead Source ROI</h1>
        <p className="text-sm text-muted-foreground">Conversion and return-on-spend by marketing channel. Enter total spend per source to see ROI.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attribution Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Converted</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Spend</TableHead>
                <TableHead>ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((row) => (
                <SourceRow key={row.source} row={row} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SourceRow({ row }: { row: Report[number] }) {
  const [spend, setSpend] = useState(String(row.spend))
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const dirty = Number(spend) !== row.spend

  return (
    <TableRow>
      <TableCell className="font-medium">{row.source.replace("_", " ")}</TableCell>
      <TableCell>{row.totalLeads}</TableCell>
      <TableCell>{row.convertedLeads}</TableCell>
      <TableCell>{(row.conversionRate * 100).toFixed(1)}%</TableCell>
      <TableCell>{formatCurrency(row.revenue)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            className="w-28 h-8"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
          />
          {dirty && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await setLeadSourceSpend(row.source, Number(spend))
                    router.refresh()
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not save spend")
                  }
                })
              }
            >
              Save
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        {row.roi === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className={row.roi >= 0 ? "text-green-600" : "text-red-600"}>{(row.roi * 100).toFixed(0)}%</span>
        )}
      </TableCell>
    </TableRow>
  )
}
