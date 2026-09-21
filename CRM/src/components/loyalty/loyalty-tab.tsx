"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getOrCreateReferralCode, adjustLoyaltyPoints, redeemLoyaltyPoints, type getPatientLoyalty } from "@/actions/loyalty"
import { formatDateTime } from "@/lib/format"

type Loyalty = Awaited<ReturnType<typeof getPatientLoyalty>>

export function LoyaltyTab({ patientId, loyalty }: { patientId: string; loyalty: Loyalty }) {
  const [pending, startTransition] = useTransition()
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [redeemOpen, setRedeemOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Referral Code</p>
            {loyalty.referralCode ? (
              <p className="text-lg font-mono font-medium">{loyalty.referralCode}</p>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await getOrCreateReferralCode(patientId)
                      router.refresh()
                    } catch {
                      toast.error("Could not generate referral code")
                    }
                  })
                }
              >
                Generate Code
              </Button>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Loyalty Points</p>
            <p className="text-lg font-medium">{loyalty.loyaltyPoints}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setAdjustOpen(true)}>Adjust</Button>
            <Button size="sm" variant="outline" onClick={() => setRedeemOpen(true)}>Redeem</Button>
          </div>
        </CardContent>
      </Card>

      {loyalty.referrals.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm font-medium">Patients Referred ({loyalty.referrals.length})</p>
            {loyalty.referrals.map((r) => (
              <p key={r.id} className="text-sm text-muted-foreground">
                {r.firstName} {r.lastName || ""} · {formatDateTime(r.createdAt)}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm font-medium">Points History</p>
          {loyalty.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            loyalty.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <Badge variant="outline" className="mr-2">{t.type.replace("_", " ")}</Badge>
                  <span className="text-muted-foreground">{t.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={t.points >= 0 ? "text-green-600" : "text-red-600"}>
                    {t.points >= 0 ? "+" : ""}{t.points}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AdjustDialog patientId={patientId} open={adjustOpen} onOpenChange={setAdjustOpen} />
      <RedeemDialog patientId={patientId} open={redeemOpen} onOpenChange={setRedeemOpen} />
    </div>
  )
}

function AdjustDialog({ patientId, open, onOpenChange }: { patientId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [points, setPoints] = useState("")
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Loyalty Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Points (use negative to deduct)</Label>
            <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="e.g. 50 or -20" />
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Goodwill gesture" />
          </div>
          <Button
            className="w-full"
            disabled={pending || !points || !reason}
            onClick={() =>
              startTransition(async () => {
                try {
                  await adjustLoyaltyPoints({ patientId, points: Number(points), reason })
                  toast.success("Points adjusted")
                  onOpenChange(false)
                  setPoints("")
                  setReason("")
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not adjust points")
                }
              })
            }
          >
            {pending ? "Saving…" : "Adjust"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RedeemDialog({ patientId, open, onOpenChange }: { patientId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [points, setPoints] = useState("")
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redeem Loyalty Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Points to redeem</Label>
            <Input type="number" min={1} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="e.g. 100" />
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Redeemed against bill #123" />
          </div>
          <Button
            className="w-full"
            disabled={pending || !points || !reason}
            onClick={() =>
              startTransition(async () => {
                try {
                  await redeemLoyaltyPoints({ patientId, points: Number(points), reason })
                  toast.success("Points redeemed")
                  onOpenChange(false)
                  setPoints("")
                  setReason("")
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not redeem points")
                }
              })
            }
          >
            {pending ? "Saving…" : "Redeem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
