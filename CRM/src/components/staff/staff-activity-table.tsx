"use client"

import { useState, useTransition } from "react"
import {
  CalendarDays,
  Receipt,
  Boxes,
  Undo2,
  ShieldAlert,
  CreditCard,
  User,
  Clock,
  Filter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatRelative, formatDateTime } from "@/lib/format"
import type { StaffActivityItem } from "@/actions/staff"

const categoryConfig: Record<
  StaffActivityItem["category"],
  { label: string; icon: typeof CalendarDays; color: string }
> = {
  PAYMENT_COLLECTED: {
    label: "Payment Collected",
    icon: Receipt,
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200",
  },
  MEDICINE_DISPENSED: {
    label: "Medicine Sold",
    icon: Boxes,
    color: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200",
  },
  MEDICINE_RETURNED: {
    label: "Medicine Returned",
    icon: Undo2,
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200",
  },
  APPOINTMENT_SCHEDULED: {
    label: "Appointment Booked",
    icon: CalendarDays,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200",
  },
  WALK_IN_TOKEN: {
    label: "Walk-in Token Issued",
    icon: Clock,
    color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200",
  },
  PATIENT_REGISTERED: {
    label: "Patient Registered",
    icon: User,
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200",
  },
  SYSTEM_AUDIT: {
    label: "System Event",
    icon: ShieldAlert,
    color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200",
  },
}

export function StaffActivityTable({ activities }: { activities: StaffActivityItem[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  const filtered = activities.filter((act) => {
    if (categoryFilter !== "ALL" && act.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div>
          <h2 className="font-semibold text-sm">Staff Action Audit & History Log</h2>
          <p className="text-xs text-muted-foreground">
            Complete transparency: Track every appointment booked, medicine dispensed/returned, and payment collected with mode & patient ID.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(val) => val && setCategoryFilter(val)}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="PAYMENT_COLLECTED">Payments Collected</SelectItem>
              <SelectItem value="MEDICINE_DISPENSED">Medicines Sold</SelectItem>
              <SelectItem value="MEDICINE_RETURNED">Medicines Returned</SelectItem>
              <SelectItem value="APPOINTMENT_SCHEDULED">Appointments Booked</SelectItem>
              <SelectItem value="WALK_IN_TOKEN">Walk-in Tokens</SelectItem>
              <SelectItem value="SYSTEM_AUDIT">System Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <tr>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4">Patient / Recipient</th>
              <th className="py-3 px-4">Payment / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                  No staff activity records found for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const cat = categoryConfig[item.category] || categoryConfig.SYSTEM_AUDIT
                const Icon = cat.icon

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <p className="font-medium text-foreground">{formatRelative(new Date(item.timestamp))}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDateTime(new Date(item.timestamp))}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">{item.staffName}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          {item.staffRole.toLowerCase()}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" className={`gap-1.5 text-xs font-medium py-0.5 px-2 ${cat.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {cat.label}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.patientUhid ? (
                        <div className="text-xs">
                          <p className="font-medium text-foreground truncate max-w-[180px]">{item.patientName || "Patient"}</p>
                          <p className="font-mono text-[11px] text-primary">{item.patientUhid}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Direct / Counter</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          {item.paymentMethod && (
                            <Badge variant="secondary" className="gap-1 font-mono text-[10px] py-0 px-1.5">
                              <CreditCard className="h-2.5 w-2.5" />
                              {item.paymentMethod}
                            </Badge>
                          )}
                          <span>{item.details}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
