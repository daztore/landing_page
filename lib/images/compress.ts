interface OptimizeImageOptions {
  maxWidth: number
  quality: number
  preferredType?: "image/jpeg" | "image/webp"
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Gagal membaca gambar."))
    }
    image.src = url
  })
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

  try {
    const image = await loadImage(file)
    const scale = Math.min(1, maxWidth / image.naturalWidth)
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      return file
    }

    canvas.width = width
    canvas.height = height
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

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
  }
}
