import type { SupabaseClient } from "@supabase/supabase-js"

export async function isActiveAdmin(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("admin_users")
    .select("id,email,is_active")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    id: data.id as string,
    email: data.email as string,
  }
}
