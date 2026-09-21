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
import { createResource } from "@/actions/resources"

export function AddResourceDialog() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"ROOM" | "EQUIPMENT">("ROOM")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Room / Equipment
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Room or Equipment</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startTransition(async () => {
              try {
                await createResource({
                  name: String(fd.get("name") || ""),
                  type,
                  description: String(fd.get("description") || "") || undefined,
                })
                toast.success("Added")
                setOpen(false)
                router.refresh()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not add")
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="res-name">Name</Label>
            <Input id="res-name" name="name" required placeholder="e.g. Laser Room 1, FUE Station 2" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType((v as "ROOM" | "EQUIPMENT") ?? "ROOM")}>
              <SelectTrigger id="res-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROOM">Room</SelectItem>
                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-description">Description</Label>
            <Textarea id="res-description" name="description" placeholder="Optional notes" />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
