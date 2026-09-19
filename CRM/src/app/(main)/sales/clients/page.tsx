import { getClients } from "@/actions/clients"
import { getAllStaff } from "@/lib/auth"
import { ClientsView } from "@/components/sales/clients/clients-view"

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const [clientsRes, staff] = await Promise.all([
    getClients(),
    getAllStaff(),
  ])

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <ClientsView
        initialClients={clientsRes.data || []}
        counts={clientsRes.counts || { all: 0, active: 0, atRisk: 0, churned: 0, paused: 0 }}
        staff={staff}
      />
    </div>
  )
}
