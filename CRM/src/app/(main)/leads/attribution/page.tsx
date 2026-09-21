import { getLeadSourceReport } from "@/actions/lead-attribution"
import { LeadAttributionView } from "@/components/leads/lead-attribution-view"

export default async function LeadAttributionPage() {
  const report = await getLeadSourceReport()
  return <LeadAttributionView report={report} />
}
