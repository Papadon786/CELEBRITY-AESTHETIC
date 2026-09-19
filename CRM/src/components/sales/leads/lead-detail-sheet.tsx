"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  MessageSquare,
  Sparkles,
  Edit2,
  Save,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import {
  updateLeadStatus,
  updateLead,
  deleteLead,
  convertLeadToPatient,
  promoteLeadToProspect,
  getLeadActivities,
  logLeadActivity,
} from "@/actions/leads"

interface LeadItem {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: string
  source: string
  value: number | null
  icpScore: number | null
  assignedToId: string | null
  assignedTo: { id: string; name: string; role: string } | null
  followUpDate: string | null
  notes: string | null
  lostReason: string | null
  convertedPatientId: string | null
  convertedPatient: { id: string; uhid: string; firstName: string; lastName: string | null } | null
  createdAt: string
  updatedAt: string
}

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  staff,
}: {
  lead: LeadItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Array<{ id: string; name: string; role: string }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activities, setActivities] = useState<any[]>([])
  const [activityNote, setActivityNote] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Edit state
  const [editName, setEditName] = useState("")
  const [editCompany, setEditCompany] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editValue, setEditValue] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editSource, setEditSource] = useState("")
  const [editIcp, setEditIcp] = useState(5)
  const [editAssignedToId, setEditAssignedToId] = useState("")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    if (lead) {
      setEditName(lead.name)
      setEditCompany(lead.company || "")
      setEditPhone(lead.phone || "")
      setEditEmail(lead.email || "")
      setEditValue(lead.value ? String(lead.value) : "")
      setEditStatus(lead.status)
      setEditSource(lead.source)
      setEditIcp(lead.icpScore ?? 5)
      setEditAssignedToId(lead.assignedToId || "")
      setEditNotes(lead.notes || "")
      setIsEditing(false)

      getLeadActivities(lead.id).then(setActivities).catch(console.error)
    }
  }, [lead])

  if (!lead) return null

  function handleStatusChange(newStatus: string) {
    if (!lead) return
    startTransition(async () => {
      try {
        await updateLeadStatus(lead.id, newStatus as any)
        toast.success(`Stage updated to ${newStatus}`)
        const updatedActs = await getLeadActivities(lead.id)
        setActivities(updatedActs)
      } catch (err: any) {
        toast.error(err?.message || "Failed to update stage")
      }
    })
  }

  function handleSaveEdit() {
    if (!lead) return
    startTransition(async () => {
      try {
        await updateLead({
          id: lead.id,
          name: editName.trim(),
          company: editCompany.trim() || null,
          phone: editPhone.trim() || null,
          email: editEmail.trim() || null,
          value: editValue ? parseFloat(editValue) : null,
          status: editStatus as any,
          source: editSource as any,
          icpScore: editIcp,
          assignedToId: editAssignedToId || null,
          notes: editNotes.trim() || null,
        })
        toast.success("Lead details updated")
        setIsEditing(false)
        const updatedActs = await getLeadActivities(lead.id)
        setActivities(updatedActs)
      } catch (err: any) {
        toast.error(err?.message || "Failed to save lead updates")
      }
    })
  }

  function handleAddNote() {
    if (!lead || !activityNote.trim()) return
    startTransition(async () => {
      try {
        await logLeadActivity(lead.id, "NOTE", "Follow-up Note Added", activityNote.trim())
        toast.success("Note logged to lead activity")
        setActivityNote("")
        const updatedActs = await getLeadActivities(lead.id)
        setActivities(updatedActs)
      } catch (err: any) {
        toast.error(err?.message || "Failed to log note")
      }
    })
  }

  function handleLogCall() {
    if (!lead) return
    startTransition(async () => {
      try {
        await logLeadActivity(
          lead.id,
          "CALL",
          "Outbound Call Made",
          `Sales outreach call to ${lead.phone || lead.name}`
        )
        toast.success("Call logged to timeline")
        const updatedActs = await getLeadActivities(lead.id)
        setActivities(updatedActs)
      } catch (err: any) {
        toast.error(err?.message || "Failed to log call")
      }
    })
  }

  function handleConvertToPatient() {
    if (!lead) return
    startTransition(async () => {
      try {
        const res = await convertLeadToPatient(lead.id)
        if (res.alreadyConverted) {
          toast.info(`Already registered as patient!`)
          router.push(`/patients/${res.patientId}`)
          return
        }
        toast.success(`Converted lead to Patient UHID ${res.uhid}!`)
        onOpenChange(false)
        router.push(`/patients/${res.patientId}`)
      } catch (err: any) {
        toast.error(err?.message || "Failed to convert lead to patient")
      }
    })
  }

  function handlePromoteToProspect() {
    if (!lead) return
    startTransition(async () => {
      try {
        const res = await promoteLeadToProspect(lead.id)
        if (res.success) {
          toast.success(`Lead "${lead.name}" advanced to Qualified Sales Prospects!`)
          onOpenChange(false)
          router.push("/sales/prospects")
        } else {
          toast.error(res.error || "Failed to promote lead")
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to promote lead")
      }
    })
  }

  function handleDeleteLead() {
    if (!lead) return
    if (!confirm(`Are you sure you want to permanently delete lead "${lead.name}"?`)) return

    startTransition(async () => {
      try {
        await deleteLead(lead.id)
        toast.success("Lead removed")
        onOpenChange(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete lead")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-6">
        <SheetHeader className="space-y-2 border-b pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                {lead.name}
                {lead.convertedPatientId && (
                  <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 text-xs gap-1">
                    <UserCheck className="h-3 w-3" /> Converted Patient
                  </Badge>
                )}
              </SheetTitle>
              {lead.company && (
                <SheetDescription className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {lead.company}
                </SheetDescription>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </div>

          {/* Pipeline Stage Quick Switcher */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-semibold">Stage:</span>
            <Select
              value={lead.status}
              onValueChange={(val) => handleStatusChange(val || "NEW")}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 text-xs font-semibold w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="DEMO">Demo / Consult</SelectItem>
                <SelectItem value="PROPOSAL">Proposal Sent</SelectItem>
                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem value="WON">Won (Converted)</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>

            {lead.value && (
              <Badge variant="outline" className="text-xs font-mono font-bold text-foreground">
                ₹{lead.value.toLocaleString()}
              </Badge>
            )}

            {lead.icpScore !== null && (
              <Badge
                className={
                  lead.icpScore >= 8
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs"
                    : lead.icpScore >= 5
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs"
                }
              >
                ICP: {lead.icpScore}/10
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Edit Form or Information Display */}
        <div className="flex-1 py-4 space-y-6">
          {isEditing ? (
            <div className="space-y-3 bg-muted/30 p-3.5 rounded-xl border">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Lead Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company</Label>
                  <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Value (₹)</Label>
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Source</Label>
                  <Select value={editSource} onValueChange={(val) => setEditSource(val || "WEBSITE")}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="GOOGLE">Google</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                      <SelectItem value="WALK_IN">Walk-in</SelectItem>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ICP Score</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={editIcp}
                    onChange={(e) => setEditIcp(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assigned Staff</Label>
                <Select value={editAssignedToId} onValueChange={(val) => setEditAssignedToId(val || "")}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select staff..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isPending}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border text-xs">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold">{lead.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{lead.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  Assigned:{" "}
                  <strong>{lead.assignedTo ? lead.assignedTo.name : "Unassigned"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  Source: <strong>{lead.source}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Convert to Patient or Prospect CTA Banner */}
          {!lead.convertedPatientId ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" /> Sales & Clinical Advancement
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Advance this lead into qualified pipeline or register as a patient.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePromoteToProspect}
                  disabled={isPending}
                  variant="outline"
                  className="gap-1.5 border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-semibold text-xs shrink-0"
                >
                  <Star className="h-3.5 w-3.5" /> Promote to Prospect
                </Button>
                <Button
                  onClick={handleConvertToPatient}
                  disabled={isPending}
                  className="gap-1.5 bg-primary text-primary-foreground font-semibold text-xs shrink-0"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Convert to Patient
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Registered as Patient UHID: {lead.convertedPatient?.uhid}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {lead.convertedPatient?.firstName} {lead.convertedPatient?.lastName || ""}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1"
                onClick={() => router.push(`/patients/${lead.convertedPatientId}`)}
              >
                View EMR <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                onClick={handleLogCall}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border bg-background py-2 text-xs font-semibold hover:bg-muted transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" /> Call & Log
              </a>
            )}
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border bg-background py-2 text-xs font-semibold hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp
              </a>
            )}
          </div>

          {/* Activity Log / Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lead Activity & History
            </h4>

            <div className="flex gap-2">
              <Input
                placeholder="Log a call outcome or follow-up note..."
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                className="text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddNote}
                disabled={isPending || !activityNote.trim()}
              >
                Post
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">
                  No activity entries recorded yet.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="border rounded-lg p-2.5 bg-card/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{act.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(act.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {act.details && (
                      <p className="text-muted-foreground text-[11px]">{act.details}</p>
                    )}
                    {act.author && (
                      <p className="text-[10px] text-muted-foreground/80 font-mono">
                        By {act.author.name}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-3 flex items-center justify-between flex-row">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteLead}
            disabled={isPending}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Lead
          </Button>

          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
