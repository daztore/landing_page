"use client"

/* eslint-disable @next/next/no-img-element -- Blob preview URLs are not compatible with Next image optimization. */

import { getPublicImageUrl } from "@/lib/admin-daz/storage-service"
import type { StorageBucket } from "@/lib/supabase/storage"

function getSafeImageSrc(src: string) {
  if (!src) {
    return ""
  }

  if (src.startsWith("blob:") || src.startsWith("/")) {
    return src
  }

  try {
    const parsed = new URL(src)
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return src
    }
  } catch {
    return ""
  }

  return ""
}

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
  const safeSrc = getSafeImageSrc(src)

  if (!safeSrc) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-stone-50 text-sm text-stone-400">
        Belum ada gambar
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border bg-stone-100">
      <img src={safeSrc} alt={alt} className="h-full w-full object-cover" />
    </div>
  )
}
