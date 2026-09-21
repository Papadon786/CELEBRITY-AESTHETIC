"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { ListChecks } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getAppointmentChecklist, toggleChecklistItem } from "@/actions/checklists"

type ChecklistRows = Awaited<ReturnType<typeof getAppointmentChecklist>>

export function AppointmentChecklistDialog({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ChecklistRows>([])
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    getAppointmentChecklist(appointmentId).then(setRows)
  }, [open, appointmentId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="text-xs h-8 gap-1" onClick={() => setOpen(true)}>
        <ListChecks className="h-3.5 w-3.5" />
        Checklist
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procedure Checklist</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checklist defined for this service yet.</p>
          ) : (
            rows.map((row) => (
              <label key={row.checklistItem.id} className="flex items-center gap-2 text-sm rounded-md border px-3 py-2">
                <Checkbox
                  checked={row.completion?.checked ?? false}
                  disabled={pending}
                  onCheckedChange={(checked) =>
                    startTransition(async () => {
                      try {
                        await toggleChecklistItem(appointmentId, row.checklistItem.id, Boolean(checked))
                        setRows((prev) =>
                          prev.map((r) =>
                            r.checklistItem.id === row.checklistItem.id
                              ? { ...r, completion: { ...r.completion, checked: Boolean(checked) } as ChecklistRows[number]["completion"] }
                              : r
                          )
                        )
                      } catch {
                        toast.error("Could not update checklist")
                      }
                    })
                  }
                />
                {row.checklistItem.label}
              </label>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
