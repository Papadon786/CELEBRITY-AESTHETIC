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
import { createConsentForm } from "@/actions/consent-forms"
import { CONSENT_TEMPLATES } from "@/lib/consent-templates"

export function AddConsentFormDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Consent Form
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Consent Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {CONSENT_TEMPLATES.map((t) => (
              <Button
                key={t.title}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setTitle(t.title)
                  setContent(t.content)
                }}
              >
                {t.title}
              </Button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Botox Consent" />
          </div>
          <div className="space-y-1.5">
            <Label>Consent Text</Label>
            <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <Button
            disabled={pending || !title || !content}
            className="w-full"
            onClick={() =>
              startTransition(async () => {
                try {
                  await createConsentForm({ patientId, title, content })
                  toast.success("Consent form created — ready to sign")
                  setOpen(false)
                  setTitle("")
                  setContent("")
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not create consent form")
                }
              })
            }
          >
            {pending ? "Creating…" : "Create Consent Form"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
