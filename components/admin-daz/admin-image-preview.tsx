"use client"

import { getPublicImageUrl } from "@/lib/admin-daz/storage-service"
import { getSafeImageSrc } from "@/lib/security/safe-image-src"
import type { StorageBucket } from "@/lib/supabase/storage"

export function AdminImagePreview({
  bucket,
  path,
  alt = "Preview gambar",
}: {
  bucket: StorageBucket
  path?: string | null
  alt?: string
}) {
  const storedSrc = path ? getPublicImageUrl(bucket, path) : ""
  const safeSrc = getSafeImageSrc(storedSrc)

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
