"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function MainContentContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const mainRef = useRef<HTMLElement>(null)

  // Whenever user navigates to a new route in sidebar or page, reset main scroll to top
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
  }, [pathname])

  return (
    <main
      ref={mainRef}
      id="crm-main-content"
      className="flex-1 min-w-0 overflow-y-auto overscroll-contain p-4 lg:p-6"
    >
      {children}
    </main>
  )
}
