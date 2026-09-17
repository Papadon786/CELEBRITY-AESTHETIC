"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { KeyRound } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetStaffPassword } from "@/actions/staff"

export function ResetPasswordDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: { id: string; name: string; email: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [newPassword, setNewPassword] = useState("")
  const [pending, startTransition] = useTransition()

  if (!staff) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!staff) return

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    startTransition(async () => {
      try {
        await resetStaffPassword(staff.id, newPassword)
        toast.success(`Password reset successfully for ${staff.name}`)
        setNewPassword("")
        onOpenChange(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to reset password")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Reset Password
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set a new login password for <span className="font-semibold text-foreground">{staff.name}</span> ({staff.email}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password (min. 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full h-10 font-medium">
            {pending ? "Updating Password…" : "Update Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
