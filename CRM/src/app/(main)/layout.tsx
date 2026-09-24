import { redirect } from "next/navigation"
import { getCurrentUserOrNull } from "@/lib/auth"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { Header } from "@/components/layout/header"
import { MainContentContainer } from "@/components/layout/main-content-container"

export const dynamic = "force-dynamic"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserOrNull()
  if (!user) redirect("/login")

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      <SidebarNav role={user.role} permissions={user.permissions} />
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header user={{ name: user.name, role: user.role, permissions: user.permissions }} />
        <MainContentContainer>{children}</MainContentContainer>
      </div>
    </div>
  )
}
