"use client"

import { useState, useTransition } from "react"
import {
  Search,
  Receipt,
  RotateCcw,
  Printer,
  FileText,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Undo2,
  Eye,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import {
  getSalesOrders,
  refundSale,
  type SalesOrderRow,
  type SalesReceiptData,
} from "@/actions/sales"
import { ReceiptModal } from "@/components/sales/receipt-modal"

export function SalesOrdersTable({
  initialOrders,
  initialTotal,
}: {
  initialOrders: SalesOrderRow[]
  initialTotal: number
}) {
  const [orders, setOrders] = useState<SalesOrderRow[]>(initialOrders)
  const [total, setTotal] = useState(initialTotal)
  const [period, setPeriod] = useState<"today" | "yesterday" | "7days" | "30days" | "all">("all")
  const [status, setStatus] = useState<string>("ALL")
  const [paymentMethod, setPaymentMethod] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  // Refund dialog state
  const [refundOrder, setRefundOrder] = useState<SalesOrderRow | null>(null)
  const [refundReason, setRefundReason] = useState("")
  const [refundPending, startRefundTransition] = useTransition()

  // Selected receipt state
  const [selectedReceipt, setSelectedReceipt] = useState<SalesReceiptData | null>(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [isFiltering, startFilterTransition] = useTransition()

  function refreshOrders(
    newPeriod = period,
    newStatus = status,
    newMethod = paymentMethod,
    newSearch = search
  ) {
    startFilterTransition(async () => {
      try {
        const res = await getSalesOrders({
          period: newPeriod,
          status: newStatus,
          paymentMethod: newMethod,
          search: newSearch,
        })
        setOrders(res.orders)
        setTotal(res.total)
      } catch (err: any) {
        toast.error("Failed to fetch sales records.")
      }
    })
  }

  function handlePeriodChange(p: typeof period) {
    setPeriod(p)
    refreshOrders(p, status, paymentMethod, search)
  }

  function handleStatusChange(s: string) {
    setStatus(s)
    refreshOrders(period, s, paymentMethod, search)
  }

  function handleMethodChange(m: string) {
    setPaymentMethod(m)
    refreshOrders(period, status, m, search)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    refreshOrders(period, status, paymentMethod, search)
  }

  function handleProcessRefund() {
    if (!refundOrder) return
    if (!refundReason.trim()) {
      toast.error("Please enter a reason for the return/refund.")
      return
    }

    startRefundTransition(async () => {
      try {
        await refundSale(refundOrder.id, refundReason)
        toast.success(`Sale #${refundOrder.billNumber} refunded successfully.`)
        setRefundOrder(null)
        setRefundReason("")
        refreshOrders()
      } catch (err: any) {
        toast.error(err?.message || "Failed to process refund.")
      }
    })
  }

  function handleViewReceipt(order: SalesOrderRow) {
    setSelectedReceipt({
      id: order.id,
      billNumber: order.billNumber,
      receiptNumber: order.receiptNumber,
      issuedAt: order.issuedAt,
      patientName: order.patientName,
      patientUhid: order.patientUhid,
      patientPhone: order.patientPhone,
      cashierName: order.cashierName,
      items: [
        {
          name: order.itemsSummary,
          quantity: order.itemCount || 1,
          unitPrice: order.totalAmount,
          discountAmount: order.discountAmount,
          taxAmount: order.taxAmount,
          total: order.netAmount,
        },
      ],
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      netAmount: order.netAmount,
      amountPaid: order.netAmount,
      paymentMethod: order.paymentMethod,
    })
    setReceiptModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="bg-card p-4 rounded-xl border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, customer name, phone, receipt…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-background"
            />
          </form>

          {/* Preset Period Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "7 Days" },
              { id: "30days", label: "30 Days" },
              { id: "all", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePeriodChange(p.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  period === p.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters: Status and Payment Method */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filters:
          </span>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-7 px-2 rounded-md border bg-background text-xs text-foreground cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PENDING">Pending</option>
          </select>

          <select
            value={paymentMethod}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="h-7 px-2 rounded-md border bg-background text-xs text-foreground cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="NET_BANKING">Net Banking</option>
          </select>

          <span className="ml-auto text-xs text-muted-foreground">
            {isFiltering ? "Updating…" : `Showing ${orders.length} of ${total} sales`}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider border-b text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice / Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Net Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Receipt className="h-9 w-9 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold text-sm">No sales records found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try relaxing your filter or search query</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-foreground font-mono">{order.billNumber}</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(order.issuedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{order.patientName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {order.patientUhid} • {order.patientPhone}
                      </p>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-foreground font-medium truncate" title={order.itemsSummary}>
                        {order.itemsSummary}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{order.itemCount} line item{order.itemCount === 1 ? "" : "s"}</p>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {order.paymentMethod}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{order.receiptNumber}</p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-foreground">{formatCurrency(order.netAmount)}</span>
                      {order.discountAmount > 0 && (
                        <p className="text-[10px] text-emerald-600 font-medium">-{formatCurrency(order.discountAmount)}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          order.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : order.status === "REFUNDED"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleViewReceipt(order)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Print / View Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        {order.status === "PAID" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setRefundOrder(order)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Process Return / Refund"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Confirmation Dialog */}
      <Dialog open={!!refundOrder} onOpenChange={(open) => !open && setRefundOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-destructive" /> Process Return & Refund
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Refund invoice #{refundOrder?.billNumber} for {refundOrder?.patientName}. Total refund amount:{" "}
              <strong>{formatCurrency(refundOrder?.netAmount || 0)}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Refunding this sale will mark the invoice as refunded, record the refund transaction, and automatically restock any physical medicine/product items into inventory.
            </p>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Return Reason</label>
              <Textarea
                placeholder="e.g. Customer returned unopened medicine, changed appointment, dosage changed…"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="text-xs h-20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefundOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={refundPending || !refundReason.trim()}
              onClick={handleProcessRefund}
              className="gap-1.5 font-semibold"
            >
              {refundPending ? "Processing…" : "Confirm Refund & Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
      />
    </div>
  )
}
