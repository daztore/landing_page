import { KatalogLayoutShell } from "@/components/katalog/katalog-layout-shell"
import { getSiteChromeData } from "@/lib/data/landing-page"

export const revalidate = 300

export default async function KatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const chrome = await getSiteChromeData()

  return (
    <KatalogLayoutShell navigation={chrome.navigation} contact={chrome.contact}>
      {children}
    </KatalogLayoutShell>
  )
}
