import { getResources } from "@/actions/resources"
import { ResourcesList } from "@/components/resources/resources-list"
import { AddResourceDialog } from "@/components/resources/add-resource-dialog"

export default async function ResourcesPage() {
  const resources = await getResources()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms & Equipment</h1>
          <p className="text-sm text-muted-foreground">
            Treatment rooms and devices (laser machines, FUE/DHI stations). Assign one to an appointment to
            catch double-bookings automatically.
          </p>
        </div>
        <AddResourceDialog />
      </div>
      <ResourcesList resources={resources} />
    </div>
  )
}
