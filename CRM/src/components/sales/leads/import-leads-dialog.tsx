"use client"

import { useState, useTransition } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { importLeadsBatch } from "@/actions/leads"

const SAMPLE_CSV = `Name,Company,Email,Phone,Status,Source,Value,ICP
Yunus Khan,Unique Tours and Travels,yunus@example.com,+919876543210,NEW,LINKEDIN,25000,8
Varsumata,Varsumata Tours,varsu@example.com,+919876543211,CONTACTED,WEBSITE,18000,6
Basava,Basava Travels,basava@example.com,+919876543212,QUALIFIED,GOOGLE,45000,9
Shri Kalika,Kalika Travels,kalika@example.com,+919876543213,PROPOSAL,INSTAGRAM,30000,7
R K Travels,R K Enterprise,rk@example.com,+919876543214,NEGOTIATION,LINKEDIN,50000,8`

export function ImportLeadsDialog() {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()

  function handleParse(text: string) {
    setCsvText(text)
    if (!text.trim()) {
      setParsedRows([])
      return
    }

    const lines = text.trim().split("\n")
    if (lines.length <= 1) {
      setParsedRows([])
      return
    }

    const rows = lines.slice(1).map((line) => {
      const parts = line.split(",").map((p) => p.trim())
      return {
        name: parts[0] || "",
        company: parts[1] || "",
        email: parts[2] || "",
        phone: parts[3] || "",
        status: parts[4] || "NEW",
        source: parts[5] || "WEBSITE",
        value: parts[6] ? parseFloat(parts[6]) : undefined,
        icpScore: parts[7] ? parseInt(parts[7], 10) : 5,
      }
    }).filter((r) => r.name.length > 0)

    setParsedRows(rows)
  }

  function handleImport() {
    if (parsedRows.length === 0) {
      toast.error("No valid lead rows found in CSV")
      return
    }

    startTransition(async () => {
      try {
        const res = await importLeadsBatch(parsedRows)
        toast.success(`Successfully imported ${res.count} leads!`)
        setOpen(false)
        setCsvText("")
        setParsedRows([])
      } catch (err: any) {
        toast.error(err?.message || "Failed to import leads")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2 font-medium">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Import Leads from CSV</DialogTitle>
              <DialogDescription className="text-xs">
                Paste comma-separated lead records to batch upload prospects into your pipeline.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              Headers: Name, Company, Email, Phone, Status, Source, Value, ICP
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={() => handleParse(SAMPLE_CSV)}
            >
              Load Sample Data
            </Button>
          </div>

          <Textarea
            rows={7}
            placeholder="Paste your CSV content here..."
            className="font-mono text-xs"
            value={csvText}
            onChange={(e) => handleParse(e.target.value)}
          />

          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  Preview ({parsedRows.length} leads detected)
                </p>
                <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ready to import
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-lg text-xs">
                <table className="w-full divide-y">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 text-left">Name</th>
                      <th className="px-3 py-1.5 text-left">Company</th>
                      <th className="px-3 py-1.5 text-left">Status</th>
                      <th className="px-3 py-1.5 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-1.5 font-medium">{r.name}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r.company || "—"}</td>
                        <td className="px-3 py-1.5">{r.status}</td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {r.value ? `₹${r.value.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isPending || parsedRows.length === 0}
            >
              {isPending ? "Importing..." : `Import ${parsedRows.length} Leads`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
