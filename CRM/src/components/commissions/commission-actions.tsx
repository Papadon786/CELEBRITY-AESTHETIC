"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { updateCommissionStatus } from "@/actions/commissions"

export function CommissionActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition()

  if (status === "PAID" || status === "REJECTED") return null

  return (
    <div className="flex items-center gap-2">
      {status === "PENDING" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateCommissionStatus(id, "APPROVED")
              } catch {
                toast.error("Could not approve")
              }
            })
          }
        >
          Approve
        </Button>
      )}
      {status === "APPROVED" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateCommissionStatus(id, "PAID")
              } catch {
                toast.error("Could not mark paid")
              }
            })
          }
        >
          Mark Paid
        </Button>
      )}
    </div>
  )
}
