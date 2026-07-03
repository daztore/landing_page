"use client"

/* eslint-disable @next/next/no-img-element -- Blob preview URLs are not compatible with Next image optimization. */

import { getPublicImageUrl } from "@/lib/admin-daz/storage-service"
import type { StorageBucket } from "@/lib/supabase/storage"

export function AdminImagePreview({
  bucket,
  path,
  alt = "Preview gambar",
  previewUrl,
}: {
  bucket: StorageBucket
  path?: string | null
  alt?: string
  previewUrl?: string
}) {
  const src = previewUrl || (path ? getPublicImageUrl(bucket, path) : "")

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-stone-50 text-sm text-stone-400">
        Belum ada gambar
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border bg-stone-100">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  )
}
