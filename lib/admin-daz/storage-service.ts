import type { StorageBucket } from "@/lib/supabase/storage"
import { createBrowserSafeId } from "@/lib/admin-daz/id"
import { getAdminBrowserClient } from "@/lib/admin-daz/supabase-browser"

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

export const ADMIN_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export function getAdminImageValidationError(file: File): string | null {
  if (!allowedImageTypes.has(file.type)) {
    return "Format gambar harus JPEG, PNG, atau WebP."
  }
  if (file.size === 0) {
    return "File gambar kosong atau tidak dapat dibaca."
  }
  if (file.size > ADMIN_IMAGE_MAX_BYTES) {
    return "Ukuran gambar maksimal 5 MB."
  }

  return null
}

export function normalizeStoragePath(path: string) {
  return path
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/")
}

function normalizeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export function createSafeStorageFileName(file: File) {
  const extension = allowedImageTypes.get(file.type)
  if (!extension) {
    throw new Error("Format gambar harus JPEG, PNG, atau WebP.")
  }

  const baseName = normalizeFilename(file.name) || "image"
  return `${baseName}-${createBrowserSafeId()}.${extension}`
}

export async function uploadAdminImage(
  bucket: StorageBucket,
  folder: string,
  file: File,
) {
  const validationError = getAdminImageValidationError(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const supabase = getAdminBrowserClient()
  if (!supabase) {
    throw new Error("Konfigurasi Supabase belum tersedia.")
  }

  const safeFolder = normalizeStoragePath(folder)
  const uniqueName = createSafeStorageFileName(file)
  const objectPath = normalizeStoragePath(
    safeFolder ? `${safeFolder}/${uniqueName}` : uniqueName,
  )

  const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return objectPath
}

export async function deleteAdminImage(bucket: StorageBucket, path: string) {
  const objectPath = normalizeStoragePath(path)
  if (!objectPath || /^https?:\/\//i.test(path) || path.startsWith("/")) {
    return
  }

  const supabase = getAdminBrowserClient()
  if (!supabase) {
    throw new Error("Konfigurasi Supabase belum tersedia.")
  }

  const { error } = await supabase.storage.from(bucket).remove([objectPath])
  if (error) {
    throw new Error(error.message)
  }
}

export function getPublicImageUrl(bucket: StorageBucket, path: string) {
  if (!path) {
    return ""
  }
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) {
    return path
  }

  const supabase = getAdminBrowserClient()
  if (!supabase) {
    return ""
  }

  return supabase.storage.from(bucket).getPublicUrl(normalizeStoragePath(path)).data
    .publicUrl
}
