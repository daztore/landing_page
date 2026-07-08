/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

function createRemotePattern(rawUrl, pathname) {
  try {
    const parsedUrl = rawUrl ? new URL(rawUrl) : undefined

    if (parsedUrl && parsedUrl.protocol === "https:") {
      return {
        protocol: "https",
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname,
      }
    }
  } catch {
    return undefined
  }

  return undefined
}

const supabaseRemotePattern = createRemotePattern(
  supabaseUrl,
  "/storage/v1/object/public/**",
)
const siteRemotePattern = createRemotePattern(siteUrl, "/**")

const remotePatterns = [supabaseRemotePattern, siteRemotePattern].filter(
  (pattern, index, patterns) =>
    pattern &&
    patterns.findIndex(
      (candidate) =>
        candidate?.protocol === pattern.protocol &&
        candidate?.hostname === pattern.hostname &&
        candidate?.port === pattern.port &&
        candidate?.pathname === pattern.pathname,
    ) === index,
)

const imageDomains = supabaseRemotePattern ? [supabaseRemotePattern.hostname] : []

const nextConfig = {
  images: {
    domains: imageDomains,
    remotePatterns,
    qualities: [75],
    formats: ["image/webp"],
    minimumCacheTTL: 3600,
    maximumRedirects: 0,
  },
}

export default nextConfig
