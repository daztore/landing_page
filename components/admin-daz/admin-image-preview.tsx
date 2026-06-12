"use client"

import Image from "next/image"

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
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  )
}
