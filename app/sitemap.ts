import type { MetadataRoute } from "next"

import { getProductSitemapEntries } from "@/features/catalog"
import { getSiteUrl } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()
  const productEntries = await getProductSitemapEntries()

  return [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/katalog", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...productEntries.map((product) => ({
      url: new URL(`/produk/${product.slug}`, siteUrl).toString(),
      lastModified: product.updatedAt ?? lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
