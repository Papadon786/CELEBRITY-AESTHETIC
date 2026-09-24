import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-y-auto items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 overflow-hidden shadow-sm">
            <Image src="/logo.jpg" alt="Crown Celebrity Aesthetic" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Crown Celebrity Aesthetic</h1>
            <p className="text-sm text-muted-foreground">Sign in to the clinic CRM</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
