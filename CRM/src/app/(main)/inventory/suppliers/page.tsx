import { getSuppliers } from "@/actions/purchase-orders"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddSupplierDialog } from "@/components/purchase-orders/add-supplier-dialog"

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Vendors for restocking medicine, consumables, and equipment.</p>
        </div>
        <AddSupplierDialog />
      </div>

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">No suppliers yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{s.name}</p>
                  <Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Active" : "Inactive"}</Badge>
                </div>
                {s.contactName && <p className="text-xs text-muted-foreground">{s.contactName}</p>}
                {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
