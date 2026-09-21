"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { ListChecks, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getServiceChecklist, addChecklistItem, deleteChecklistItem } from "@/actions/checklists"

type ChecklistItem = Awaited<ReturnType<typeof getServiceChecklist>>[number]

export function ManageChecklistDialog({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [label, setLabel] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    getServiceChecklist(serviceId).then(setItems)
  }, [open, serviceId])

  function refresh() {
    getServiceChecklist(serviceId).then(setItems)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <ListChecks className="h-3.5 w-3.5" />
        Checklist
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procedure Checklist — {serviceName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Steps staff must confirm during this procedure. Shown on each appointment for this service.
          </p>

          {items.length > 0 && (
            <div className="space-y-1.5">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{i.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await deleteChecklistItem(i.id)
                          refresh()
                        } catch {
                          toast.error("Could not remove")
                        }
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 pt-2 border-t">
            <div className="flex-1 space-y-1.5">
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Confirm consent form signed" />
            </div>
            <Button
              disabled={pending || !label.trim()}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await addChecklistItem(serviceId, label)
                    setLabel("")
                    refresh()
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not add")
                  }
                })
              }
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
