import { getSupabaseClient } from "@/lib/supabase/client"

export type StorageBucket = "landing_page" | "catalogs" | "feedback_customer_photos"

function normalizeObjectPath(path: string) {
  return path
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "")
    .replace(/\/{2,}/g, "/")
}

export function resolveStorageImageUrl(
  bucket: StorageBucket,
  pathOrUrl?: string | null,
  fallback = "",
): string {
  const value = pathOrUrl?.trim()

  if (!value) {
    return fallback
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
    return value
  }

  const supabase = getSupabaseClient()
  const objectPath = normalizeObjectPath(value)

  if (!supabase || !objectPath) {
    return fallback
  }

  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath)
    return data.publicUrl || fallback
  } catch {
    return fallback
  }
}
