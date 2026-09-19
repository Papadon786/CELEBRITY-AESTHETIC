"use client"

import { useState, useTransition } from "react"
import { Search, Plus, Crown, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddClientDialog } from "./add-client-dialog"
import { ClientsTable, type TableClient } from "./clients-table"
import { ClientDetailSheet } from "./client-detail-sheet"
import {
  updateClientRenewalStage,
  updateClientStatus,
  convertClientToPatient,
} from "@/actions/clients"
import type { ClientStatus, RenewalStage } from "@/types/database"

interface ClientsViewProps {
  initialClients: TableClient[]
  counts: {
    all: number
    active: number
    atRisk: number
    churned: number
    paused: number
  }
  staff: Array<{ id: string; name: string; role: string }>
}

export function ClientsView({ initialClients, counts: initialCounts, staff }: ClientsViewProps) {
  const [clients, setClients] = useState<TableClient[]>(initialClients)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"ALL" | ClientStatus>("ALL")
  const [selectedClient, setSelectedClient] = useState<TableClient | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Calculate live counts
  const counts = {
    all: clients.length,
    active: clients.filter((c) => c.status === "ACTIVE").length,
    atRisk: clients.filter((c) => c.status === "AT_RISK").length,
    churned: clients.filter((c) => c.status === "CHURNED").length,
    paused: clients.filter((c) => c.status === "PAUSED").length,
  }

  // Filter clients
  const filteredClients = clients.filter((c) => {
    if (activeTab !== "ALL" && c.status !== activeTab) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.membershipTier && c.membershipTier.toLowerCase().includes(q)) ||
      (c.treatmentFocus && c.treatmentFocus.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.accountManagerName && c.accountManagerName.toLowerCase().includes(q))
    )
  })

  function handleRenewalStageChange(id: string, stage: RenewalStage) {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, renewalStage: stage } : c))
    )
    if (selectedClient && selectedClient.id === id) {
      setSelectedClient((prev: any) => ({ ...prev, renewalStage: stage }))
    }

    startTransition(async () => {
      try {
        const res = await updateClientRenewalStage(id, stage)
        if (!res.success) {
          toast.error(res.error || "Failed to update renewal stage")
        } else {
          toast.success("Renewal stage updated")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update renewal stage")
      }
    })
  }

  function handleStatusChange(id: string, status: ClientStatus) {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    )
    if (selectedClient && selectedClient.id === id) {
      setSelectedClient((prev: any) => ({ ...prev, status }))
    }

    startTransition(async () => {
      try {
        const res = await updateClientStatus(id, status)
        if (!res.success) {
          toast.error(res.error || "Failed to update client status")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update client status")
      }
    })
  }

  function handleConvertToPatient(client: TableClient) {
    startTransition(async () => {
      try {
        const res = await convertClientToPatient(client.id)
        if (res.success) {
          toast.success(`Client ${client.name} registered as Patient (UHID: ${res.uhid})`)
          setClients((prev) =>
            prev.map((c) => (c.id === client.id ? { ...c, patientId: res.patientId || null } : c))
          )
        } else {
          toast.error(res.error || "Failed to convert to patient")
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to convert to patient")
      }
    })
  }

  function handleSelectClient(c: TableClient) {
    setSelectedClient(c)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>VIP MEMBERSHIP & RETAINER MANAGEMENT</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-primary font-bold">Crown Celebrity Aesthetic</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Aesthetic Client Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            VIP memberships, annual skin & hair maintenance retainers, and corporate partner accounts
          </p>
        </div>

        <AddClientDialog staff={staff} />
      </div>

      {/* Search Bar Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients, VIP tiers, treatment focus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-9.5 text-xs bg-card/60"
        />
      </div>

      {/* Status Filter Tabs with Counts (All, Active Retainers, Due for Booster, Churned, Paused) */}
      <div className="flex items-center gap-6 border-b border-border/60 text-xs font-semibold pb-1">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-1.5 pb-2.5 transition-colors relative ${
            activeTab === "ALL"
              ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>All Accounts</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-1.5 pb-2.5 transition-colors relative ${
            activeTab === "ACTIVE"
              ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Active Retainers</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {counts.active}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("AT_RISK")}
          className={`flex items-center gap-1.5 pb-2.5 transition-colors relative ${
            activeTab === "AT_RISK"
              ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Due for Booster</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {counts.atRisk}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PAUSED")}
          className={`flex items-center gap-1.5 pb-2.5 transition-colors relative ${
            activeTab === "PAUSED"
              ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Paused</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {counts.paused}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CHURNED")}
          className={`flex items-center gap-1.5 pb-2.5 transition-colors relative ${
            activeTab === "CHURNED"
              ? "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Inactive / Churned</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {counts.churned}
          </span>
        </button>
      </div>

      {/* Main Clients Table */}
      <ClientsTable
        clients={filteredClients}
        onSelectClient={handleSelectClient}
        onRenewalStageChange={handleRenewalStageChange}
        onConvertToPatient={handleConvertToPatient}
      />

      {/* Detail Sheet */}
      <ClientDetailSheet
        client={selectedClient}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStageChange={(id, stage) =>
          handleRenewalStageChange(id, stage)
        }
        onStatusChange={(id, status) => handleStatusChange(id, status)}
      />
    </div>
  )
}
