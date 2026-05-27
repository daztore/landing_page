"use client"

import { useEffect, useState } from "react"
import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import { KatalogHeader } from "@/components/katalog/katalog-header"

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <SiteNavigation />
        <main className="min-h-screen pt-20 md:pt-0 pb-20 md:pb-0">{children}</main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      {!isMobile && <SiteNavigation />}
      {isMobile && <KatalogHeader searchQuery="" onSearchChange={() => {}} />}
      <main className={`min-h-screen ${!isMobile ? "pt-20 pb-20 md:pt-0 md:pb-0" : "pb-0"}`}>
        {children}
      </main>
      {!isMobile && <SiteFooter />}
    </>
  )
}
