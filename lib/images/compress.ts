interface OptimizeImageOptions {
  maxWidth: number
  quality: number
  preferredType?: "image/jpeg" | "image/webp"
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

function getOutputType(file: File, preferredType?: "image/jpeg" | "image/webp") {
  if (preferredType) {
    return preferredType
  }

  return file.type === "image/webp" ? "image/webp" : "image/jpeg"
}

function withImageExtension(filename: string, type: string) {
  const extension = type === "image/webp" ? "webp" : "jpg"
  return filename.replace(/\.[^.]+$/, "") + `.${extension}`
}

export async function optimizeImageFile(
  file: File,
  { maxWidth, quality, preferredType }: OptimizeImageOptions,
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file
  }

  if (typeof createImageBitmap !== "function") {
    return file
  }

  let bitmap: ImageBitmap | null = null

  try {
    bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      return file
    }

    canvas.width = width
    canvas.height = height
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)

    const outputType = getOutputType(file, preferredType)
    const blob = await canvasToBlob(canvas, outputType, quality)

    if (!blob || blob.size >= file.size) {
      return file
    }

    return new File([blob], withImageExtension(file.name, blob.type || outputType), {
      type: blob.type || outputType,
      lastModified: Date.now(),
    })
  } catch {
    return file
  } finally {
    bitmap?.close()
  }
}
