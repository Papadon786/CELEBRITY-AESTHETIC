"use client"

import { useState, useTransition } from "react"
import {
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Award,
  Sparkles,
  ShoppingBag,
  Percent,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import { getSalesAnalytics, type SalesAnalytics } from "@/actions/sales"

export function SalesAnalyticsView({
  initialAnalytics,
}: {
  initialAnalytics: SalesAnalytics
}) {
  const [period, setPeriod] = useState<"today" | "7days" | "30days" | "all">("30days")
  const [analytics, setAnalytics] = useState<SalesAnalytics>(initialAnalytics)
  const [isPending, startTransition] = useTransition()

  function handlePeriodChange(p: typeof period) {
    setPeriod(p)
    startTransition(async () => {
      try {
        const data = await getSalesAnalytics(p)
        setAnalytics(data)
      } catch {
        toast.error("Failed to load analytics.")
      }
    })
  }

  function handleExportCSV() {
    try {
      const rows = [
        ["Zafoor Clinic - Sales Performance Report"],
        [`Period: ${period.toUpperCase()}`],
        [`Generated: ${new Date().toLocaleString("en-IN")}`],
        [],
        ["Metric", "Value"],
        ["Total Net Revenue", `₹${analytics.totalRevenue}`],
        ["Total Gross Sales", `₹${analytics.totalGross}`],
        ["Total Discounts Given", `₹${analytics.totalDiscounts}`],
        ["Total Tax Collected", `₹${analytics.totalTax}`],
        ["Total Orders", `${analytics.orderCount}`],
        ["Average Order Value", `₹${analytics.averageOrderValue}`],
        [],
        ["Payment Method", "Orders Count", "Amount (₹)", "Share (%)"],
        ...analytics.paymentMethodSplit.map((p) => [
          p.method,
          p.count.toString(),
          p.total.toString(),
          `${p.percentage}%`,
        ]),
        [],
        ["Top Selling Item", "Quantity Sold", "Revenue (₹)"],
        ...analytics.topSellingItems.map((it) => [
          it.name,
          it.quantity.toString(),
          it.revenue.toString(),
        ]),
      ]

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n")
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `zafoor_sales_report_${period}_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Sales report downloaded successfully!")
    } catch {
      toast.error("Failed to export report.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-foreground">Sales Intelligence & Revenue Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track commercial turnover, payment channel mix, and product velocity</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector Pills */}
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "7days", label: "7 Days" },
              { id: "30days", label: "30 Days" },
              { id: "all", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePeriodChange(p.id as any)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  period === p.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5 text-xs font-medium h-8">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Net Sales Revenue</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Gross: {formatCurrency(analytics.totalGross)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Invoices / Orders</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{analytics.orderCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Average Order Value (AOV)</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.averageOrderValue)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Average basket size per customer
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Discounts Given</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalDiscounts)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tax collected: {formatCurrency(analytics.totalTax)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Payment Breakdown & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payment Channels Split (Col 1-5) */}
        <div className="lg:col-span-5 bg-card p-5 rounded-xl border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Method Mix
            </h3>
            <Badge variant="outline" className="text-[10px]">
              {analytics.orderCount} Transactions
            </Badge>
          </div>

          <div className="space-y-3.5">
            {analytics.paymentMethodSplit.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No payment data recorded in this period</p>
            ) : (
              analytics.paymentMethodSplit.map((item) => (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.method}</span>
                      <span className="text-[10px] text-muted-foreground">({item.count} orders)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">{formatCurrency(item.total)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.method === "UPI"
                          ? "bg-teal-500"
                          : item.method === "CASH"
                          ? "bg-emerald-500"
                          : item.method === "CARD"
                          ? "bg-blue-500"
                          : "bg-violet-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(4, item.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Services & Products (Col 6-12) */}
        <div className="lg:col-span-7 bg-card p-5 rounded-xl border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> Top Selling Services & Products
            </h3>
            <Badge variant="outline" className="text-[10px]">
              By Revenue Generated
            </Badge>
          </div>

          <div className="divide-y divide-border/60">
            {analytics.topSellingItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No sales registered in this period</p>
            ) : (
              analytics.topSellingItems.map((item, idx) => (
                <div key={item.name} className="py-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="h-6 w-6 rounded-md bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.quantity} unit{item.quantity === 1 ? "" : "s"} sold</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
