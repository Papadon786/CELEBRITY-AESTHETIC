import type { StaffRole } from "@/types/database"

export type TabItemDefinition = {
  id: string
  href: string
  label: string
  group: "Care" | "Clinical" | "Sales" | "Website" | "Calendar"
  description: string
}

export const ALL_AVAILABLE_TABS: TabItemDefinition[] = [
  // Care
  { id: "dashboard", href: "/dashboard", label: "Dashboard", group: "Care", description: "Clinical overview, today's appointments, quick stats" },
  { id: "patients", href: "/patients", label: "Patients", group: "Care", description: "Patient directory, registration, health profiles" },
  { id: "appointments", href: "/appointments", label: "Appointments", group: "Care", description: "Appointment scheduling and daily slot board" },
  { id: "queue", href: "/queue", label: "Today's Queue", group: "Care", description: "Live waiting room, token calling, check-ins" },
  { id: "inventory", href: "/inventory", label: "Medicine & Stock", group: "Care", description: "Medicine dispensing, stock returns, stock alerts" },
  { id: "suppliers", href: "/inventory/suppliers", label: "Suppliers", group: "Care", description: "Vendor directory for restocking" },
  { id: "purchase_orders", href: "/inventory/purchase-orders", label: "Purchase Orders", group: "Care", description: "Reorder from suppliers and receive stock" },
  { id: "prescriptions", href: "/prescriptions", label: "Prescriptions", group: "Care", description: "Digital Rx pad, scanned prescription uploads, cross-patient search" },
  { id: "waiting_list", href: "/waiting-list", label: "Waiting List", group: "Care", description: "Standby patient queue for early openings" },
  { id: "follow_ups", href: "/follow-ups", label: "Follow-ups", group: "Care", description: "Post-consultation follow-up scheduling" },
  { id: "communications", href: "/communications", label: "Communications", group: "Care", description: "Patient SMS, WhatsApp, and call logs" },

  // Clinical
  { id: "doctor_availability", href: "/appointments/availability", label: "Doctor Availability", group: "Clinical", description: "Doctor shift timings and off-duty calendar" },
  { id: "resources", href: "/resources", label: "Rooms & Equipment", group: "Clinical", description: "Treatment room and device catalog, used to prevent double-booking" },
  { id: "doctor_templates", href: "/templates", label: "Doctor Templates", group: "Clinical", description: "SOAP note presets, Rx prescription templates" },
  { id: "digital_signature", href: "/settings/signature", label: "Digital Signature", group: "Clinical", description: "Doctor signature for prescriptions and EMR" },
  { id: "audit_logs", href: "/audit-logs", label: "Audit Logs", group: "Clinical", description: "System security and staff activity logs" },

  // Sales
  { id: "leads", href: "/sales/leads", label: "Leads & Pipeline", group: "Sales", description: "Inquiry funnel, overdue follow-ups, kanban pipeline, and lead conversions" },
  { id: "prospects", href: "/sales/prospects", label: "Prospects", group: "Sales", description: "Qualified prospect pipeline, demo bookings, ICP scoring, proposals, and deal negotiation" },
  { id: "clients", href: "/sales/clients", label: "Clients", group: "Sales", description: "Corporate and client accounts, contract values, account managers, and renewals" },
  { id: "sales", href: "/sales", label: "Sales & POS", group: "Sales", description: "Point of Sale counter, quick sales, customer orders, and sales receipts" },
  { id: "commissions", href: "/sales/commissions", label: "Commissions", group: "Sales", description: "Sales rep commission tracking, approval, and payout" },

  // Billing & Finance
  { id: "payments", href: "/payments", label: "Payments", group: "Sales", description: "Patient payment ledger — mark pending payments as paid" },
  { id: "billing", href: "/billing", label: "Billing & Invoices", group: "Sales", description: "Create invoices, record payments, print receipts" },
  { id: "refunds", href: "/billing/refunds", label: "Refunds", group: "Sales", description: "Patient refund authorizations and ledger" },
  { id: "finance_dashboard", href: "/finance/dashboard", label: "Finance Dashboard", group: "Sales", description: "Revenue KPIs, payment method splits, P&L" },
  { id: "outstanding_dues", href: "/finance/outstanding", label: "Outstanding Dues", group: "Sales", description: "Unpaid bills and credit patient balances" },
  { id: "emi_installments", href: "/finance/installments", label: "EMI Installments", group: "Sales", description: "Overdue and upcoming No Cost EMI installments across all patients" },
  { id: "cash_counter", href: "/finance/cash-counter", label: "Cash Counter", group: "Sales", description: "Physical cash drawer opening/closing sessions" },
  { id: "expenses", href: "/finance/expenses", label: "Expenses", group: "Sales", description: "Clinic petty cash and vendor expense logging" },
  { id: "reports", href: "/finance/reports", label: "Financial Reports", group: "Sales", description: "Audited revenue statements and tax breakdowns" },
  { id: "services", href: "/services", label: "Services Catalog", group: "Sales", description: "Consultation and procedure tariff master" },
  { id: "packages", href: "/services/packages", label: "Treatment Packages", group: "Sales", description: "Session-based package catalog and per-patient session tracking" },

  // Website
  { id: "website_content", href: "/website/content", label: "Website Content", group: "Website", description: "Homepage banners, clinic timing, doctors list" },
  { id: "website_reviews", href: "/website/reviews", label: "Patient Reviews", group: "Website", description: "Moderate testimonials published on website" },
  { id: "website_faqs", href: "/website/faqs", label: "Website FAQs", group: "Website", description: "Publish answers to common patient questions" },

  // Calendar
  { id: "calendar", href: "/calendar", label: "Master Calendar", group: "Calendar", description: "Multi-doctor unified calendar view" },
]

export type ActionScopeDefinition = {
  key: string
  label: string
  category: "Appointments" | "Medicines & Inventory" | "Sales & Leads" | "Billing & Cash" | "Patient Data & Exports"
  description: string
}

export const ALL_ACTION_SCOPES: ActionScopeDefinition[] = [
  {
    key: "canBookAppointments",
    label: "Schedule Appointments & Issue Tokens",
    category: "Appointments",
    description: "Book new appointments and issue walk-in queue tokens",
  },
  {
    key: "canEditAppointments",
    label: "Edit / Reschedule Appointments",
    category: "Appointments",
    description: "Change appointment time, doctor, or reschedule existing bookings",
  },
  {
    key: "canCancelAppointments",
    label: "Cancel Existing Appointments",
    category: "Appointments",
    description: "Cancel confirmed or scheduled appointments",
  },
  {
    key: "canDispenseMedicine",
    label: "Dispense / Sell Medicines",
    category: "Medicines & Inventory",
    description: "Log medicine counter sales and deduct stock units",
  },
  {
    key: "canReturnMedicine",
    label: "Record Medicine Returns",
    category: "Medicines & Inventory",
    description: "Accept patient medicine returns and restock inventory",
  },
  {
    key: "canManageMedicineCatalog",
    label: "Add / Edit Medicine Catalog & Pricing",
    category: "Medicines & Inventory",
    description: "Create new medicines, adjust retail prices, archive items",
  },
  {
    key: "canManageLeads",
    label: "Manage Leads & Pipeline",
    category: "Sales & Leads",
    description: "Create, reassign, update stages, and convert leads to patients",
  },
  {
    key: "canExportLeads",
    label: "Import / Export Leads (CSV)",
    category: "Sales & Leads",
    description: "Bulk import new leads via CSV or export lead lists",
  },
  {
    key: "canManageSales",
    label: "Process Counter Sales & Point of Sale (POS)",
    category: "Billing & Cash",
    description: "Create sales invoices, collect payments, issue receipts and manage sales orders",
  },
  {
    key: "canCollectPayment",
    label: "Collect Payments (Cash / UPI / Card)",
    category: "Billing & Cash",
    description: "Collect patient payments and issue official receipts",
  },
  {
    key: "canProcessRefunds",
    label: "Process Refunds",
    category: "Billing & Cash",
    description: "Authorize and disburse patient payment refunds",
  },
  {
    key: "canViewFinancialReports",
    label: "View Revenue & Financial Analytics",
    category: "Billing & Cash",
    description: "Access finance dashboard, profit & loss, and cash reports",
  },
  {
    key: "canExportData",
    label: "Export Patient / Billing Data (CSV / PDF)",
    category: "Patient Data & Exports",
    description: "Download patient lists, billing registers, or reports",
  },
]

export type StaffPermissions = {
  allowedTabs: string[] // List of allowed hrefs (e.g. ["/dashboard", "/patients", ...])
  actionScopes: Record<string, boolean>
}

// ── Default Role Presets ──────────────────────────────────────────────────

export const DEFAULT_ADMIN_PERMISSIONS: StaffPermissions = {
  allowedTabs: ALL_AVAILABLE_TABS.map((t) => t.href),
  actionScopes: ALL_ACTION_SCOPES.reduce((acc, s) => {
    acc[s.key] = true
    return acc
  }, {} as Record<string, boolean>),
}

export const DEFAULT_DOCTOR_PERMISSIONS: StaffPermissions = {
  allowedTabs: [
    "/dashboard",
    "/patients",
    "/appointments",
    "/queue",
    "/calendar",
    "/templates",
    "/settings/signature",
    "/prescriptions",
  ],
  actionScopes: {
    canBookAppointments: true,
    canEditAppointments: true,
    canCancelAppointments: true,
    canDispenseMedicine: true,
    canReturnMedicine: false,
    canManageMedicineCatalog: false,
    canManageLeads: false,
    canExportLeads: false,
    canCollectPayment: false,
    canProcessRefunds: false,
    canViewFinancialReports: false,
    canExportData: false,
  },
}

export const DEFAULT_RECEPTIONIST_PERMISSIONS: StaffPermissions = {
  allowedTabs: [
    "/dashboard",
    "/patients",
    "/appointments",
    "/queue",
    "/sales/leads",
    "/sales/prospects",
    "/sales/clients",
    "/sales",
    "/inventory",
    "/prescriptions",
    "/waiting-list",
    "/follow-ups",
    "/communications",
    "/calendar",
  ],
  actionScopes: {
    canBookAppointments: true,
    canEditAppointments: false, // Admin only by default
    canCancelAppointments: false, // Admin only by default
    canDispenseMedicine: true,
    canReturnMedicine: true,
    canManageMedicineCatalog: false, // Admin only
    canManageLeads: true,
    canExportLeads: true,
    canCollectPayment: true,
    canProcessRefunds: false, // Admin only
    canViewFinancialReports: false, // Admin only
    canExportData: false,
  },
}

/** Reception-desk-adjacent billing/finance specialist — was previously falling through to the receptionist preset with no distinct scope. */
export const DEFAULT_BILLING_PERMISSIONS: StaffPermissions = {
  allowedTabs: [
    "/dashboard",
    "/patients",
    "/payments",
    "/billing",
    "/billing/refunds",
    "/finance/dashboard",
    "/finance/outstanding",
    "/finance/cash-counter",
    "/finance/expenses",
    "/finance/reports",
    "/finance/installments",
    "/services",
  ],
  actionScopes: {
    canBookAppointments: false,
    canEditAppointments: false,
    canCancelAppointments: false,
    canDispenseMedicine: false,
    canReturnMedicine: false,
    canManageMedicineCatalog: false,
    canManageLeads: false,
    canExportLeads: false,
    canCollectPayment: true,
    canProcessRefunds: false, // Admin only
    canViewFinancialReports: true,
    canExportData: true,
  },
}

/** Clinical support staff who perform procedures but don't prescribe or manage the clinic's business side. */
export const DEFAULT_NURSE_PERMISSIONS: StaffPermissions = {
  allowedTabs: [
    "/dashboard",
    "/patients",
    "/appointments",
    "/queue",
    "/inventory",
    "/waiting-list",
    "/follow-ups",
  ],
  actionScopes: {
    canBookAppointments: true,
    canEditAppointments: false,
    canCancelAppointments: false,
    canDispenseMedicine: true,
    canReturnMedicine: true,
    canManageMedicineCatalog: false,
    canManageLeads: false,
    canExportLeads: false,
    canCollectPayment: false,
    canProcessRefunds: false,
    canViewFinancialReports: false,
    canExportData: false,
  },
}

/** Laser/FUE/PMU technicians running procedures — same day-to-day footprint as nursing staff. */
export const DEFAULT_TECHNICIAN_PERMISSIONS: StaffPermissions = DEFAULT_NURSE_PERMISSIONS

/** Sales/leads specialist — was previously just a relabeled receptionist with no distinct scope. */
export const DEFAULT_SALES_PERMISSIONS: StaffPermissions = {
  allowedTabs: [
    "/dashboard",
    "/patients",
    "/sales/leads",
    "/sales/prospects",
    "/sales/clients",
    "/sales",
    "/sales/commissions",
    "/communications",
  ],
  actionScopes: {
    canBookAppointments: false,
    canEditAppointments: false,
    canCancelAppointments: false,
    canDispenseMedicine: false,
    canReturnMedicine: false,
    canManageMedicineCatalog: false,
    canManageLeads: true,
    canExportLeads: true,
    canCollectPayment: false,
    canProcessRefunds: false,
    canViewFinancialReports: false,
    canExportData: false,
  },
}

const ROLE_DEFAULTS: Record<StaffRole, StaffPermissions> = {
  ADMIN: DEFAULT_ADMIN_PERMISSIONS,
  DOCTOR: DEFAULT_DOCTOR_PERMISSIONS,
  RECEPTIONIST: DEFAULT_RECEPTIONIST_PERMISSIONS,
  BILLING: DEFAULT_BILLING_PERMISSIONS,
  NURSE: DEFAULT_NURSE_PERMISSIONS,
  TECHNICIAN: DEFAULT_TECHNICIAN_PERMISSIONS,
  SALES: DEFAULT_SALES_PERMISSIONS,
}

/**
 * Returns the effective permissions for a user, falling back to role defaults if not customized.
 */
export function getEffectivePermissions(user: { role: StaffRole; permissions?: any }): StaffPermissions {
  if (user.role === "ADMIN") {
    // Admin always has full access
    return DEFAULT_ADMIN_PERMISSIONS
  }

  const roleDefault = ROLE_DEFAULTS[user.role] ?? DEFAULT_RECEPTIONIST_PERMISSIONS

  if (!user.permissions || typeof user.permissions !== "object") {
    return roleDefault
  }

  const custom = user.permissions as Partial<StaffPermissions>

  return {
    allowedTabs: Array.isArray(custom.allowedTabs) ? custom.allowedTabs : roleDefault.allowedTabs,
    actionScopes: {
      ...roleDefault.actionScopes,
      ...(custom.actionScopes || {}),
    },
  }
}

/**
 * Checks if a user has access to a specific route/tab.
 */
export function hasTabAccess(user: { role: StaffRole; permissions?: any }, href: string): boolean {
  if (user.role === "ADMIN") return true
  const effective = getEffectivePermissions(user)
  // Match prefix or exact
  return effective.allowedTabs.some((tab) => href === tab || href.startsWith(`${tab}/`))
}

/**
 * Checks if a user has permission to perform a specific action scope.
 */
export function hasActionScope(user: { role: StaffRole; permissions?: any }, scopeKey: string): boolean {
  if (user.role === "ADMIN") return true
  const effective = getEffectivePermissions(user)
  return !!effective.actionScopes[scopeKey]
}
