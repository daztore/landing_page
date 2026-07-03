const allowedImageProtocols = new Set(["https:"])

function getAllowedImageOrigins() {
  const origins = new Set<string>()

  for (const rawUrl of [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]) {
    if (!rawUrl) {
      continue
    }

    try {
      origins.add(new URL(rawUrl).origin)
    } catch {
      // Invalid environment URLs should not make dynamic image sources safe.
    }
  }

  return origins
}

export function getSafeImageSrc(
  src: string | null | undefined,
  options?: {
    allowRelative?: boolean
  },
) {
  const value = typeof src === "string" ? src.trim() : ""

  if (!value || value.startsWith("//")) {
    return ""
  }

  if (value.startsWith("/")) {
    return options?.allowRelative === false ? "" : value
  }

  try {
    const parsed = new URL(value)

    if (!allowedImageProtocols.has(parsed.protocol)) {
      return ""
    }

    if (!getAllowedImageOrigins().has(parsed.origin)) {
      return ""
    }

    return parsed.toString()
  } catch {
    return ""
  }
}
