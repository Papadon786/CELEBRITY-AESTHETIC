"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { payInstallment } from "@/actions/payment-plans"
import { formatCurrency, formatDate } from "@/lib/format"
import type { getPaymentPlanForBill } from "@/actions/payment-plans"

type Plan = NonNullable<Awaited<ReturnType<typeof getPaymentPlanForBill>>>

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "default",
  OVERDUE: "destructive",
  WAIVED: "secondary",
}

export function PaymentPlanCard({ plan }: { plan: Plan }) {
  const [pending, startTransition] = useTransition()
  const now = new Date()

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">EMI Plan{plan.noCostEmi ? " — No Cost EMI" : ""}</p>
          <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"}>{plan.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(Number(plan.totalAmount))} financed
          {Number(plan.downPayment) > 0 ? ` (${formatCurrency(Number(plan.downPayment))} down payment)` : ""} across{" "}
          {plan.numberOfInstallments} installments
        </p>
        <div className="space-y-2">
          {plan.installments.map((inst) => {
            const isOverdue = inst.status === "PENDING" && new Date(inst.dueDate) < now
            return (
              <div key={inst.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm">Installment #{inst.installmentNumber}</p>
                  <p className="text-xs text-muted-foreground">Due {formatDate(inst.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCurrency(Number(inst.amount))}</span>
                  <Badge variant={isOverdue ? "destructive" : statusVariant[inst.status] ?? "outline"}>
                    {isOverdue ? "OVERDUE" : inst.status}
                  </Badge>
                  {inst.status === "PENDING" && (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await payInstallment({ installmentId: inst.id })
                            toast.success("Installment paid")
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not record payment")
                          }
                        })
                      }
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
