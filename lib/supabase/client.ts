import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null | undefined

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient !== undefined) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    supabaseClient = null
    return supabaseClient
  }

  try {
    new URL(url)
  } catch {
    console.error("[Supabase] NEXT_PUBLIC_SUPABASE_URL tidak valid; fallback lokal digunakan.")
    supabaseClient = null
    return supabaseClient
  }

  supabaseClient = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })

  return supabaseClient
}
