import { ShoppingCart, Receipt, TrendingUp, Sparkles, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  getSalesCatalog,
  getSalesOrders,
  getSalesAnalytics,
} from "@/actions/sales"
import { PosTerminal } from "@/components/sales/pos-terminal"
import { SalesOrdersTable } from "@/components/sales/sales-orders-table"
import { SalesAnalyticsView } from "@/components/sales/sales-analytics-view"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const [catalog, ordersData, analyticsData] = await Promise.all([
    getSalesCatalog(),
    getSalesOrders({ period: "all", page: 1, pageSize: 20 }),
    getSalesAnalytics("30days"),
  ])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales & Point of Sale</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              POS Terminal
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Process counter checkouts, dispense OTC medicines, bill aesthetic services, and track clinic sales
          </p>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="pos" className="space-y-5">
        <TabsList className="bg-muted/70 p-1 rounded-xl h-11 border">
          <TabsTrigger
            value="pos"
            className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg text-xs font-semibold gap-1.5 px-4 h-9"
          >
            <ShoppingCart className="h-4 w-4 text-primary" /> POS Terminal (Quick Sale)
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg text-xs font-semibold gap-1.5 px-4 h-9"
          >
            <Receipt className="h-4 w-4 text-emerald-600" /> Sales Invoices ({ordersData.total})
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-background data-[state=active]:shadow-xs rounded-lg text-xs font-semibold gap-1.5 px-4 h-9"
          >
            <TrendingUp className="h-4 w-4 text-violet-600" /> Sales Intelligence
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Interactive POS Terminal */}
        <TabsContent value="pos" className="mt-0 focus-visible:outline-none">
          <PosTerminal catalog={catalog} />
        </TabsContent>

        {/* Tab 2: Sales Invoices & Receipts Ledger */}
        <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
          <SalesOrdersTable
            initialOrders={ordersData.orders}
            initialTotal={ordersData.total}
          />
        </TabsContent>

        {/* Tab 3: Sales Performance & Analytics */}
        <TabsContent value="analytics" className="mt-0 focus-visible:outline-none">
          <SalesAnalyticsView initialAnalytics={analyticsData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
