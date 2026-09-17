import { requireRole } from "@/lib/auth"
import { getStaffMembers, getStaffActivityHistory } from "@/actions/staff"
import { StaffTable } from "@/components/staff/staff-table"
import { StaffActivityTable } from "@/components/staff/staff-activity-table"
import { AddStaffDialog } from "@/components/staff/add-staff-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Users, Stethoscope, UserCheck, Shield, Activity, Lock, CheckCircle2, XCircle } from "lucide-react"

export default async function StaffManagementPage() {
  await requireRole("ADMIN")
  const [staffList, activities] = await Promise.all([
    getStaffMembers(),
    getStaffActivityHistory({ limit: 60 }),
  ])

  const totalStaff = staffList.length
  const activeDoctors = staffList.filter((s) => s.role === "DOCTOR" && s.active).length
  const activeReceptionists = staffList.filter((s) => s.role === "RECEPTIONIST" && s.active).length
  const activeAdmins = staffList.filter((s) => s.role === "ADMIN" && s.active).length

  return (
    <div className="space-y-6">
      {/* Responsive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Login Management</h1>
          <p className="text-sm text-muted-foreground">
            Zero-Trust Role Scopes: Manage authenticated clinic accounts and monitor real-time staff actions.
          </p>
        </div>
        <AddStaffDialog />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total Staff Logins</p>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-1">{totalStaff}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Staff Accounts</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Doctors</p>
            <Stethoscope className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-teal-600 dark:text-teal-400">{activeDoctors}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">EMR & Consultations</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Receptionists</p>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{activeReceptionists}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Front Desk & Dispensing</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Administrators</p>
            <Shield className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">{activeAdmins}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Full Unrestricted Access</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="staff-list" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="staff-list" className="gap-2">
            <Users className="h-4 w-4" />
            <span>Staff Logins</span>
          </TabsTrigger>
          <TabsTrigger value="staff-activity" className="gap-2">
            <Activity className="h-4 w-4" />
            <span>Staff Action History ({activities.length})</span>
          </TabsTrigger>
          <TabsTrigger value="staff-scopes" className="gap-2">
            <Lock className="h-4 w-4" />
            <span>Permission Scopes & Rules</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Staff Accounts */}
        <TabsContent value="staff-list" className="space-y-4 outline-none">
          <StaffTable staffList={staffList as any} />
        </TabsContent>

        {/* Tab 2: Real-time Activity History */}
        <TabsContent value="staff-activity" className="space-y-4 outline-none">
          <StaffActivityTable activities={activities} />
        </TabsContent>

        {/* Tab 3: Permission Scopes & Guardrails Breakdown */}
        <TabsContent value="staff-scopes" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Receptionist Scopes */}
            <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Receptionist Staff (Selective Access)</h3>
                  <p className="text-xs text-muted-foreground">Front desk operations with strict zero-trust guardrails</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Schedule Appointments & Tokens:</strong> Can register new patients, book appointments, and issue walk-in tokens.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Stock Dispensing & Returns:</strong> Can record medicines sold/dispensed and patient medicine returns against Patient ID.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Payment Collection Transparency:</strong> Can collect payments with mandatory payment form (Cash, UPI, Card) tied to Patient UHID.</span>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-start gap-2 text-destructive">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>NO Appointment Edits:</strong> Cannot edit, reschedule, or cancel appointments after creation (Admin only).</span>
                  </div>
                  <div className="flex items-start gap-2 text-destructive">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>NO Medicine Creation:</strong> Cannot add new medicines to the catalog or change medicine prices (Admin only).</span>
                  </div>
                  <div className="flex items-start gap-2 text-destructive">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>NO Sensitive Finance / Settings:</strong> Cannot access Finance dashboards, delete audit logs, or edit doctor signatures.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrator Scopes */}
            <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Administrator (Full Unrestricted Access)</h3>
                  <p className="text-xs text-muted-foreground">Complete management, editing, financial, and audit control</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Appointment Management:</strong> Can modify, reschedule, reassign, or cancel any appointment anytime.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Medicine Catalog Control:</strong> Can create new medicine products, set reference stocks, edit retail prices, and archive products.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Staff Management & Password Resets:</strong> Can create staff logins, toggle active status, and reset passwords.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Financial & Audit Oversight:</strong> Full access to financial P&L dashboards, cash sessions, refunds, expenses, and staff activity trails.</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
