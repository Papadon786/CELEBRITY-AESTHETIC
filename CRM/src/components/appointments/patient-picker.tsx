"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Search, X, User, Check, Loader2, UserPlus, Phone, Hash } from "lucide-react"
import { getPatients, getPatientById } from "@/actions/patients"
import { patientDisplayName } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type PatientOption = { id: string; name: string; uhid: string; phone: string }

export function PatientPicker({
  value,
  onChange,
  initial,
}: {
  value: string
  onChange: (patientId: string) => void
  initial?: PatientOption | null
}) {
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(initial ?? null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PatientOption[]>([])
  const [recentPatients, setRecentPatients] = useState<PatientOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync initial patient if provided
  useEffect(() => {
    if (initial) {
      setSelectedPatient(initial)
    }
  }, [initial])

  // If value is provided or changed externally and we don't have details, fetch it
  useEffect(() => {
    if (!value) {
      setSelectedPatient(null)
      return
    }
    if (selectedPatient?.id === value) return

    let cancelled = false
    getPatientById(value).then((patient) => {
      if (cancelled || !patient) return
      setSelectedPatient({
        id: patient.id,
        name: patientDisplayName(patient),
        uhid: patient.uhid,
        phone: patient.phone,
      })
    })

    return () => {
      cancelled = true
    }
  }, [value, selectedPatient?.id])

  // Fetch recent patients on mount for quick 1-click select
  useEffect(() => {
    let cancelled = false
    getPatients({ pageSize: 10 }).then(({ patients: list }) => {
      if (cancelled) return
      const mapped = list.map((p) => ({
        id: p.id,
        name: patientDisplayName(p),
        uhid: p.uhid,
        phone: p.phone,
      }))
      setRecentPatients(mapped)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Debounced search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const { patients: list } = await getPatients({ query: query.trim(), pageSize: 15 })
        setResults(
          list.map((p) => ({
            id: p.id,
            name: patientDisplayName(p),
            uhid: p.uhid,
            phone: p.phone,
          }))
        )
      } catch (err) {
        console.error("Failed to search patients:", err)
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(patient: PatientOption) {
    setSelectedPatient(patient)
    onChange(patient.id)
    setIsOpen(false)
    setQuery("")
  }

  function handleClear() {
    setSelectedPatient(null)
    onChange("")
    setQuery("")
    setIsOpen(true)
  }

  // If a patient is selected, display a clear, high-contrast selected card
  if (selectedPatient) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-primary/5 border-primary/20 transition-all">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">{selectedPatient.name}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground shrink-0">
                  {selectedPatient.uhid}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />
                <span>{selectedPatient.phone}</span>
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            Change
          </Button>
        </div>
        <Link
          href="/patients/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <UserPlus className="h-3 w-3" />
          <span>Register a new patient (opens in new tab)</span>
        </Link>
      </div>
    )
  }

  const displayedList = query.trim() ? results : recentPatients

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name, phone, or UHID…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9 h-10 text-xs sm:text-sm"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          {!query.trim() && (
            <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 border-b">
              Recent Patients (or type to search)
            </div>
          )}

          {displayedList.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {query.trim() ? `No patients found matching "${query}"` : "No patients available"}
              </p>
              <Link
                href="/patients/new"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register this patient now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {displayedList.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelect(patient)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{patient.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Hash className="h-3 w-3" />
                        {patient.uhid}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                    </div>
                  </div>
                  <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <Link
          href="/patients/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <UserPlus className="h-3 w-3" />
          <span>+ Register a new patient (opens in new tab)</span>
        </Link>
        <span className="text-[11px] text-muted-foreground">Search by phone, UHID, or name</span>
      </div>
    </div>
  )
}
