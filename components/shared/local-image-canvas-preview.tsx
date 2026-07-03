"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const safeImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"])

export function LocalImageCanvasPreview({
  file,
  alt = "Preview gambar",
  className,
  placeholder,
}: {
  file: File | null
  alt?: string
  className?: string
  placeholder?: ReactNode
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [status, setStatus] = useState<
    "empty" | "loading" | "ready" | "unsupported" | "error"
  >(file ? "loading" : "empty")

  useEffect(() => {
    let cancelled = false
    let bitmap: ImageBitmap | null = null

    async function renderPreview() {
      if (!file) {
        setStatus("empty")
        return
      }

      setStatus("loading")

      if (!safeImageMimeTypes.has(file.type)) {
        setStatus("error")
        return
      }

      if (typeof createImageBitmap !== "function") {
        setStatus("unsupported")
        return
      }

      try {
        bitmap = await createImageBitmap(file)
        if (cancelled) {
          return
        }

        const canvas = canvasRef.current
        const context = canvas?.getContext("2d")

        if (!canvas || !context) {
          setStatus("error")
          return
        }

        const maxWidth = 1200
        const ratio = Math.min(1, maxWidth / bitmap.width)
        const width = Math.max(1, Math.round(bitmap.width * ratio))
        const height = Math.max(1, Math.round(bitmap.height * ratio))

        canvas.width = width
        canvas.height = height
        context.clearRect(0, 0, width, height)
        context.drawImage(bitmap, 0, 0, width, height)
        setStatus("ready")
      } catch {
        if (!cancelled) {
          setStatus("error")
        }
      }
    }

    void renderPreview()

    return () => {
      cancelled = true
      bitmap?.close()
    }
  }, [file])

  if (!file || status === "empty") {
    return <>{placeholder ?? <span>Belum ada gambar</span>}</>
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className={cn(className, status !== "ready" && "hidden")}
      />
      {status !== "ready" && (
        <span>{status === "loading" ? "Memuat preview..." : "File sudah dipilih, preview tidak tersedia."}</span>
      )}
    </>
  )
}
