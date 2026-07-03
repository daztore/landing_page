import type { ReactNode } from "react"

import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import { KatalogHeader } from "@/components/katalog/katalog-header"
import type { NavigationItem, SiteContact } from "@/lib/data/types"

interface KatalogLayoutShellProps {
  children: ReactNode
  navigation: NavigationItem[]
  contact: SiteContact
}

export function KatalogLayoutShell({
  children,
  navigation,
  contact,
}: KatalogLayoutShellProps) {
  return (
    <>
      <div className="hidden md:block">
        <SiteNavigation items={navigation} contact={contact} />
      </div>
      <div className="md:hidden">
        <KatalogHeader />
      </div>
      <main className="min-h-screen">{children}</main>
      <div className="hidden md:block">
        <SiteFooter items={navigation} contact={contact} />
      </div>
    </>
  )
}
