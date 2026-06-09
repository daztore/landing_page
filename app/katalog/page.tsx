import { KatalogPage } from "@/components/katalog/katalog-page"
import { getCatalogData } from "@/lib/data/landing-page"

export const metadata = {
  title: "Katalog Premium | daztore.id",
  description: "Jelajahi koleksi eksklusif mahar, seserahan, bouquet, dan wedding gift boxes kami",
}

export const revalidate = 300

export default async function Katalog() {
  const data = await getCatalogData()
  return <KatalogPage data={data} />
}
