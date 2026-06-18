"use client"

import { useEffect, useState } from "react"
import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import { KatalogHeader } from "@/components/katalog/katalog-header"
import type { NavigationItem, SiteContact } from "@/lib/data/types"

interface KatalogLayoutShellProps {
  children: React.ReactNode
  navigation: NavigationItem[]
  contact: SiteContact
}

export function KatalogLayoutShell({
  children,
  navigation,
  contact,
}: KatalogLayoutShellProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)")
    const syncMobileState = () => {
      setIsMobile(mobileQuery.matches)
    }

    const frameId = window.requestAnimationFrame(() => {
      syncMobileState()
      setMounted(true)
    })
    mobileQuery.addEventListener("change", syncMobileState)

    return () => {
      window.cancelAnimationFrame(frameId)
      mobileQuery.removeEventListener("change", syncMobileState)
    }
  }, [])

  if (!mounted) {
    return (
      <>
        <SiteNavigation items={navigation} contact={contact} />
        <main className="min-h-screen pt-20 md:pt-0 pb-20 md:pb-0">{children}</main>
        <SiteFooter items={navigation} contact={contact} />
      </>
    )
  }

  return (
    <>
      {!isMobile && <SiteNavigation items={navigation} contact={contact} />}
      {isMobile && <KatalogHeader />}
      <main className={`min-h-screen ${!isMobile ? "pt-20 pb-20 md:pt-0 md:pb-0" : "pb-0"}`}>
        {children}
      </main>
      {!isMobile && <SiteFooter items={navigation} contact={contact} />}
    </>
  )
}
