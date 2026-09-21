"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SignaturePad } from "@/components/emr/signature-pad"
import { AddConsentFormDialog } from "./add-consent-form-dialog"
import { signConsentForm, declineConsentForm } from "@/actions/consent-forms"
import { formatDateTime } from "@/lib/format"
import type { getPatientConsentForms } from "@/actions/consent-forms"

type ConsentForms = Awaited<ReturnType<typeof getPatientConsentForms>>

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  SIGNED: "default",
  DECLINED: "destructive",
}

export function ConsentFormsTab({ patientId, forms }: { patientId: string; forms: ConsentForms }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Procedure-specific consent, e-signed by the patient and witnessed by staff.</p>
        <AddConsentFormDialog patientId={patientId} />
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">No consent forms yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forms.map((f) => (
            <ConsentFormCard key={f.id} form={f} />
          ))}
        </div>
      )}
    </div>
  )
}

function ConsentFormCard({ form }: { form: ConsentForms[number] }) {
  const [signing, setSigning] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{form.title}</p>
          <Badge variant={statusVariant[form.status] ?? "outline"}>{form.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{form.content}</p>

        {form.status === "SIGNED" && (
          <div className="pt-2 space-y-1">
            {form.signatureUrl && <img src={form.signatureUrl} alt="Patient signature" className="h-16 border rounded bg-white" />}
            <p className="text-xs text-muted-foreground">
              Signed {form.signedAt ? formatDateTime(form.signedAt) : ""}
              {form.witnessedBy ? ` · witnessed by ${form.witnessedBy.name}` : ""}
            </p>
          </div>
        )}

        {form.status === "PENDING" && !signing && (
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" onClick={() => setSigning(true)}>Sign Now</Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await declineConsentForm(form.id)
                  } catch {
                    toast.error("Could not decline")
                  }
                })
              }
            >
              Decline
            </Button>
          </div>
        )}

        {form.status === "PENDING" && signing && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">Have the patient sign below:</p>
            <SignaturePad
              saving={pending}
              onSave={(url) =>
                startTransition(async () => {
                  try {
                    await signConsentForm({ consentFormId: form.id, signatureUrl: url })
                    setSigning(false)
                    toast.success("Consent form signed")
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not save signature")
                  }
                })
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
