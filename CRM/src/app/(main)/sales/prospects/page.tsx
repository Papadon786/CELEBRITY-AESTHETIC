import { getProspects } from "@/actions/prospects"
import { getAllStaff } from "@/lib/auth"
import { ProspectsView } from "@/components/sales/prospects/prospects-view"

export const dynamic = "force-dynamic"

export default async function ProspectsPage() {
  const [prospectsRes, staff] = await Promise.all([
    getProspects(),
    getAllStaff(),
  ])

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <ProspectsView
        initialProspects={prospectsRes.data || []}
        stats={prospectsRes.stats || { totalCount: 0, inDemoCount: 0, inProposalCount: 0, pipelineValue: 0 }}
        staff={staff}
      />
    </div>
  )
}
