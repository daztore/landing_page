/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseRemotePattern

try {
  const parsedSupabaseUrl = supabaseUrl ? new URL(supabaseUrl) : undefined

  if (
    parsedSupabaseUrl &&
    (parsedSupabaseUrl.protocol === "https:" || parsedSupabaseUrl.protocol === "http:")
  ) {
    supabaseRemotePattern = {
      protocol: parsedSupabaseUrl.protocol.slice(0, -1),
      hostname: parsedSupabaseUrl.hostname,
      port: parsedSupabaseUrl.port,
      pathname: "/storage/v1/object/public/**",
    }
  }
} catch {
  supabaseRemotePattern = undefined
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: supabaseRemotePattern ? [supabaseRemotePattern] : [],
  },
}

export default nextConfig
