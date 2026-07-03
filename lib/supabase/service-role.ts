import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let serviceRoleClient: SupabaseClient | null | undefined

export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  if (serviceRoleClient !== undefined) {
    return serviceRoleClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    serviceRoleClient = null
    return serviceRoleClient
  }

  try {
    new URL(url)
  } catch {
    console.error("[Supabase] NEXT_PUBLIC_SUPABASE_URL tidak valid untuk service role.")
    serviceRoleClient = null
    return serviceRoleClient
  }

  serviceRoleClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })

  return serviceRoleClient
}
