/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

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

const remotePatterns = [supabaseRemotePattern].filter(Boolean)

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
