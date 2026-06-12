"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null | undefined

export function getAdminBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    browserClient = null
    return browserClient
  }

  try {
    new URL(url)
  } catch {
    browserClient = null
    return browserClient
  }

  browserClient = createBrowserClient(url, publishableKey)
  return browserClient
}
