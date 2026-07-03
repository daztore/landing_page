const fallbackSiteUrl = "https://daztore.web.id"

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl

  try {
    return new URL(value)
  } catch {
    return new URL(fallbackSiteUrl)
  }
}
