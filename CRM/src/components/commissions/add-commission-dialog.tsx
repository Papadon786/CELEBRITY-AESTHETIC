"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCommission } from "@/actions/commissions"

type StaffOption = { id: string; name: string; role: string }

export function AddCommissionDialog({ staff }: { staff: StaffOption[] }) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [saleAmount, setSaleAmount] = useState(0)
  const [ratePercent, setRatePercent] = useState(0)
  const [amount, setAmount] = useState(0)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const salesStaff = staff.filter((s) => s.role === "SALES" || s.role === "RECEPTIONIST" || s.role === "ADMIN")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Log Commission
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Commission</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startTransition(async () => {
              try {
                await createCommission({
                  userId,
                  saleAmount,
                  ratePercent: ratePercent || undefined,
                  amount,
                  notes: String(fd.get("notes") || "") || undefined,
                })
                toast.success("Commission logged")
                setOpen(false)
                router.refresh()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not log commission")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label>Sales Rep</Label>
            <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {salesStaff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Sale Amount (₹)</Label>
              <Input type="number" min={0} value={saleAmount} onChange={(e) => setSaleAmount(Number(e.target.value) || 0)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Rate (%)</Label>
              <Input type="number" min={0} max={100} value={ratePercent} onChange={(e) => setRatePercent(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label>Commission (₹)</Label>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea name="notes" placeholder="Optional — which sale/client this is for" />
          </div>
          <Button type="submit" disabled={pending || !userId} className="w-full">
            {pending ? "Saving…" : "Log Commission"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
