import { listTreatmentPackages } from "@/actions/packages"
import { getServices } from "@/actions/services"
import { PackagesList } from "@/components/packages/packages-list"
import { AddPackageDialog } from "@/components/packages/add-package-dialog"

export default async function PackagesPage() {
  const [packages, services] = await Promise.all([listTreatmentPackages(), getServices()])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Treatment Packages</h1>
          <p className="text-sm text-muted-foreground">
            Session-based bundles (FUE/DHI courses, laser packages) patients buy up front. Assign one to a
            patient from their profile to track sessions remaining.
          </p>
        </div>
        <AddPackageDialog services={services} />
      </div>
      <PackagesList packages={packages} />
    </div>
  )
}
