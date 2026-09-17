"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Menu, ChevronDown, Settings, LogOut, Shield, User } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { NavContent } from "@/components/layout/sidebar-nav"
import { initials } from "@/lib/format"
import { logout } from "@/actions/auth"

export function Header({ user }: { user: { name: string; role: string; permissions?: any } }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur px-3 sm:px-4 lg:px-6">
      {/* Mobile Hamburger Drawer Trigger */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
          <SheetTitle className="sr-only">Zafoor Clinic Navigation Menu</SheetTitle>
          <NavContent role={user.role} permissions={user.permissions} onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name, UHID, phone…"
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>
      </form>

      {/* New Patient CTA Button */}
      <Button
        size="sm"
        className="gap-1 sm:gap-1.5 h-9 shrink-0 px-2.5 sm:px-3 text-xs sm:text-sm font-medium"
        nativeButton={false}
        render={
          <Link href="/patients/new">
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">New Patient</span>
            <span className="sm:hidden">New</span>
          </Link>
        }
      />

      {/* User Avatar & Profile Dropdown ("CA" = Clinic Admin) */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-full p-1 hover:bg-muted/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0"
          aria-label={`User Account: ${user.name}`}
          title={`Logged in as ${user.name} (${user.role.replace("_", " ")})`}
        >
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-primary/20 bg-primary/10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold tracking-tight">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">{user.name}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{user.role.replace("_", " ").toLowerCase()}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg border">
          <DropdownMenuLabel className="p-2">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ").toLowerCase()} · Zafoor Clinic</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2"
            render={
              <Link href="/settings/signature" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Doctor Settings & Signature</span>
              </Link>
            }
          />
          {user.role === "ADMIN" && (
            <>
              <DropdownMenuItem
                className="cursor-pointer gap-2 py-2"
                render={
                  <Link href="/settings/staff" className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Staff & User Logins</span>
                  </Link>
                }
              />
              <DropdownMenuItem
                className="cursor-pointer gap-2 py-2"
                render={
                  <Link href="/audit-logs" className="flex items-center gap-2 w-full">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Audit Logs</span>
                  </Link>
                }
              />
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout()}
            className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
