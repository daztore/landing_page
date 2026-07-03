import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

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
  ]
}
