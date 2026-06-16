import type { SupabaseClient } from "@supabase/supabase-js"

import {
  feedbackImageMaxBytes,
  type feedbackCustomerPhotoBucket,
  type feedbackProductPhotoBucket,
} from "@/lib/feedback/constants"
import type { StorageBucket } from "@/lib/supabase/storage"

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

type FeedbackImageBucket =
  | typeof feedbackProductPhotoBucket
  | typeof feedbackCustomerPhotoBucket

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

function createSafeId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getFeedbackImageValidationError(file: File): string | null {
  if (!allowedImageTypes.has(file.type)) {
    return "Format gambar harus JPEG, PNG, atau WebP."
  }
  if (file.size === 0) {
    return "File gambar kosong atau tidak dapat dibaca."
  }
  if (file.size > feedbackImageMaxBytes) {
    return "Ukuran setiap gambar maksimal 5 MB."
  }

  return null
}

export function createFeedbackStorageFileName(file: File) {
  const extension = allowedImageTypes.get(file.type)
  if (!extension) {
    throw new Error("Format gambar harus JPEG, PNG, atau WebP.")
  }

  const baseName = normalizeFilename(file.name) || "feedback-image"
  return `${baseName}-${createSafeId()}.${extension}`
}

export async function uploadFeedbackImage(
  client: SupabaseClient,
  bucket: FeedbackImageBucket | StorageBucket,
  folder: string,
  file: File,
) {
  const validationError = getFeedbackImageValidationError(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const safeFolder = normalizeStoragePath(folder)
  const objectPath = normalizeStoragePath(
    safeFolder
      ? `${safeFolder}/${createFeedbackStorageFileName(file)}`
      : createFeedbackStorageFileName(file),
  )

  const { error } = await client.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return objectPath
}
