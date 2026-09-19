import { type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  className,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: "default" | "info" | "accent" | "warning" | "danger" | "success"
  hint?: string
  className?: string
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-500/15",
    info: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border border-violet-500/15",
    accent: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 border border-teal-500/15",
    warning: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/15",
    danger: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/15",
    success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/15",
  }

  return (
    <Card className={cn("group flex flex-col justify-between overflow-hidden border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs transition-all duration-150 hover:border-border hover:shadow-sm", className)}>
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105 sm:h-10 sm:w-10",
            toneClasses[tone]
          )}
        >
          <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl tabular-nums text-right">
          {value}
        </p>
      </div>
      <div className="mt-2.5 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-snug break-words">
          {label}
        </p>
        {hint && <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{hint}</p>}
      </div>
    </Card>
  )
}
