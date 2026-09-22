"use client"

import { useState } from "react"
import { Printer, CheckCircle, Download, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import type { SalesReceiptData } from "@/actions/sales"

export function ReceiptModal({
  receipt,
  open,
  onOpenChange,
}: {
  receipt: SalesReceiptData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [format, setFormat] = useState<"thermal" | "standard">("thermal")

  if (!receipt) return null

  function handlePrint() {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b bg-muted/20 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Sale Completed Successfully</DialogTitle>
                <p className="text-xs text-muted-foreground">Invoice #{receipt.billNumber} • Receipt #{receipt.receiptNumber}</p>
              </div>
            </div>
            {/* Format toggle for thermal receipt vs standard A4 */}
            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFormat("thermal")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  format === "thermal"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                POS Slip (80mm)
              </button>
              <button
                type="button"
                onClick={() => setFormat("standard")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  format === "standard"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Standard Bill
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Receipt Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto bg-card print:overflow-visible print:max-h-none print:p-0">
          <div
            className={`mx-auto bg-card rounded-lg border p-5 shadow-xs font-mono text-xs leading-relaxed ${
              format === "thermal" ? "max-w-[340px]" : "max-w-md font-sans"
            }`}
          >
            {/* Clinic Brand Header */}
            <div className="text-center pb-4 border-b border-dashed border-border/80">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base mb-1.5">
                CA
              </div>
              <h2 className="font-bold text-sm sm:text-base tracking-tight text-foreground font-sans">
                CELEBRITY AESTHETIC
              </h2>
              <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                Skin, Hair, PMU & Laser Aesthetics Clinic
              </p>
              <p className="text-[10px] text-muted-foreground font-sans leading-tight mt-1">
                No. 69/70, St. Xavier Street, George Town, Chennai - 600001
              </p>
              <p className="text-[10px] text-muted-foreground font-sans">
                Phone: +91 8940399403 • Reg #CA-TN-2026
              </p>
            </div>

            {/* Transaction Metadata */}
            <div className="py-3 border-b border-dashed border-border/80 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill / Invoice:</span>
                <span className="font-semibold text-foreground">{receipt.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt No:</span>
                <span className="font-semibold text-foreground">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span>{new Date(receipt.issuedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cashier:</span>
                <span>{receipt.cashierName}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="py-3 border-b border-dashed border-border/80 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-semibold text-foreground">{receipt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UHID:</span>
                <span>{receipt.patientUhid}</span>
              </div>
              {receipt.patientPhone && receipt.patientPhone !== "—" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{receipt.patientPhone}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-3 border-b border-dashed border-border/80">
              <div className="flex justify-between font-semibold text-[11px] pb-1.5 border-b border-border/40">
                <span>ITEM</span>
                <span className="text-right">TOTAL</span>
              </div>
              <div className="divide-y divide-border/20 pt-1">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground truncate pr-2">{item.name}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                      {item.discountAmount > 0 && <span>-Disc: {formatCurrency(item.discountAmount)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Totals */}
            <div className="py-3 border-b border-dashed border-border/80 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(receipt.totalAmount)}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount:</span>
                  <span>- {formatCurrency(receipt.discountAmount)}</span>
                </div>
              )}
              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>GST / Tax:</span>
                  <span>+ {formatCurrency(receipt.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/60">
                <span>NET TOTAL:</span>
                <span className="text-primary">{formatCurrency(receipt.netAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-foreground pt-1">
                <span>Paid via {receipt.paymentMethod}:</span>
                <span>{formatCurrency(receipt.amountPaid)}</span>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="pt-4 text-center text-[10px] text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Thank you for visiting Crown Celebrity Aesthetic!</p>
              <p>For inquiries, WhatsApp +91 9591047171</p>
              <p className="text-[9px] text-muted-foreground/80">Computer-generated receipt • Valid without physical signature</p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between print:hidden">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="gap-1 text-xs">
            <X className="h-3.5 w-3.5" /> Close
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-semibold">
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
