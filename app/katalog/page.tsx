import type { Metadata } from "next"

import { KatalogPage } from "@/components/katalog/katalog-page"
import { getCatalogData } from "@/lib/data/landing-page"

export const metadata: Metadata = {
  title: "Katalog Premium | daztore.id",
  description: "Jelajahi koleksi eksklusif mahar, seserahan, bouquet, dan wedding gift boxes kami",
  alternates: {
    canonical: "/katalog",
  },
  openGraph: {
    title: "Katalog Premium | daztore.id",
    description:
      "Jelajahi koleksi eksklusif mahar, seserahan, bouquet, dan wedding gift boxes kami.",
    url: "/katalog",
    siteName: "daztore.id",
    images: [
      {
        url: "/hero-mahar.webp",
        width: 1200,
        height: 630,
        alt: "Katalog premium daztore.id",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Katalog Premium | daztore.id",
    description:
      "Jelajahi koleksi eksklusif mahar, seserahan, bouquet, dan wedding gift boxes kami.",
    images: ["/hero-mahar.webp"],
  },
}

export const revalidate = 300

export default async function Katalog() {
  const data = await getCatalogData()
  return <KatalogPage data={data} />
}
