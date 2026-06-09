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
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
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
      {isMobile && <KatalogHeader searchQuery="" onSearchChange={() => {}} />}
      <main className={`min-h-screen ${!isMobile ? "pt-20 pb-20 md:pt-0 md:pb-0" : "pb-0"}`}>
        {children}
      </main>
      {!isMobile && <SiteFooter items={navigation} contact={contact} />}
    </>
  )
}
