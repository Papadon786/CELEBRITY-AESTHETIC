"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarClock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createPaymentPlan } from "@/actions/payment-plans"
import { formatCurrency } from "@/lib/format"

export function SetupEmiDialog({ billId, balanceDue }: { billId: string; balanceDue: number }) {
  const [open, setOpen] = useState(false)
  const [downPayment, setDownPayment] = useState(0)
  const [installments, setInstallments] = useState(3)
  const [noCostEmi, setNoCostEmi] = useState(true)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const financed = Math.max(balanceDue - downPayment, 0)
  const perInstallment = installments > 0 ? financed / installments : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <CalendarClock className="h-4 w-4" />
        Set Up EMI Plan
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up EMI Plan</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              try {
                await createPaymentPlan({
                  billId,
                  downPayment,
                  numberOfInstallments: installments,
                  startDate: new Date(),
                  noCostEmi,
                })
                toast.success("EMI plan created")
                setOpen(false)
                router.refresh()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not create EMI plan")
              }
            })
          }}
        >
          <p className="text-sm text-muted-foreground">Outstanding balance: {formatCurrency(balanceDue)}</p>
          <div className="space-y-1.5">
            <Label htmlFor="emi-down">Down payment (₹, optional)</Label>
            <Input
              id="emi-down"
              type="number"
              min={0}
              max={balanceDue}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emi-count">Number of installments</Label>
            <Input
              id="emi-count"
              type="number"
              min={2}
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value) || 2)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="emi-nocost" checked={noCostEmi} onCheckedChange={(v) => setNoCostEmi(v === true)} />
            <Label htmlFor="emi-nocost" className="font-normal">No Cost EMI (no interest added)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {installments} × {formatCurrency(perInstallment)} / month
          </p>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating…" : "Create EMI Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
