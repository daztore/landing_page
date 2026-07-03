"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, ImagePlus, Loader2, Send, Star, X } from "lucide-react"

import { LocalImageCanvasPreview } from "@/components/shared/local-image-canvas-preview"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  feedbackCustomerPhotoMaxFiles,
  feedbackRecommendations,
} from "@/lib/feedback/constants"
import { getFeedbackImageValidationError } from "@/lib/feedback/storage"
import { optimizeImageFile } from "@/lib/images/compress"

interface PhotoItem {
  file: File
}

export function FeedbackSubmissionForm({
  feedbackRequestId,
}: {
  feedbackRequestId: string
}) {
  const [rating, setRating] = useState(0)
  const [criticism, setCriticism] = useState("")
  const [testimonial, setTestimonial] = useState("")
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>(
    [],
  )
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  function updatePhotos(nextPhotos: PhotoItem[]) {
    setPhotos(nextPhotos)
  }

  function toggleRecommendation(value: string) {
    setSelectedRecommendations((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  async function selectPhotos(files?: FileList | null) {
    setError("")

    const nextPhotos = Array.from(files ?? [])
    if (nextPhotos.length === 0) {
      return
    }

    if (photos.length + nextPhotos.length > feedbackCustomerPhotoMaxFiles) {
      setError(`Maksimal ${feedbackCustomerPhotoMaxFiles} foto pelanggan.`)
      return
    }

    for (const photo of nextPhotos) {
      const validationError = getFeedbackImageValidationError(photo)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    const optimizedPhotos: File[] = []
    for (const photo of nextPhotos) {
      const optimizedPhoto = await optimizeImageFile(photo, {
        maxWidth: 1400,
        quality: 0.82,
      })
      const optimizedValidationError =
        getFeedbackImageValidationError(optimizedPhoto)

      if (optimizedValidationError) {
        setError(optimizedValidationError)
        return
      }

      optimizedPhotos.push(optimizedPhoto)
    }

    updatePhotos([
      ...photos,
      ...optimizedPhotos.map((photo) => ({
        file: photo,
      })),
    ])
  }

  function removePhoto(index: number) {
    updatePhotos(photos.filter((_, currentIndex) => currentIndex !== index))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (rating < 1 || rating > 5) {
        throw new Error("Rating wajib dipilih.")
      }

      if (!criticism.trim() && !testimonial.trim()) {
        throw new Error("Isi kritik/saran atau testimoni singkat.")
      }

      const formData = new FormData()
      formData.append("rating", String(rating))
      formData.append("criticism", criticism)
      formData.append("testimonial", testimonial)
      selectedRecommendations.forEach((recommendation) => {
        formData.append("recommendations", recommendation)
      })
      photos.forEach((photo) => {
        formData.append("photos", photo.file)
      })

      const response = await fetch(`/feedback/${feedbackRequestId}/submit`, {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Gagal mengirim feedback.")
      }

      updatePhotos([])
      setSubmitted(true)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal mengirim feedback.",
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
        <CheckCircle2 className="size-8" />
        <h2 className="mt-3 font-serif text-2xl font-bold">Terima kasih</h2>
        <p className="mt-2 text-sm leading-6">
          Feedback Anda sudah terkirim. Masukan ini membantu daztore.id menjaga
          detail produk dan pelayanan tetap hangat.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-stone-900">Rating</h2>
          <p className="mt-1 text-sm text-stone-500">Pilih 1 sampai 5 bintang.</p>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1
            const active = value <= rating

            return (
              <button
                key={value}
                type="button"
                className="flex size-12 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-500 shadow-sm transition hover:border-amber-400 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-200"
                onClick={() => setRating(value)}
                aria-label={`Rating ${value}`}
              >
                <Star className={active ? "fill-current" : ""} />
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-stone-900">Foto terbaik</h2>
          <p className="mt-1 text-sm text-stone-500">
            Maksimal {feedbackCustomerPhotoMaxFiles} foto, masing-masing 5 MB,
            otomatis dioptimalkan.
          </p>
        </div>
        <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm">
          <ImagePlus className="size-4" />
          Pilih foto
          <input
            className="sr-only"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void selectPhotos(event.target.files)}
          />
        </label>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <PhotoPreview
                key={`${photo.file.name}-${photo.file.lastModified}-${index}`}
                photo={photo}
                onRemove={() => removePhoto(index)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-900">Rekomendasi</h2>
        <div className="flex flex-wrap gap-2">
          {feedbackRecommendations.map((recommendation) => {
            const active = selectedRecommendations.includes(recommendation)

            return (
              <button
                key={recommendation}
                type="button"
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border-amber-500 bg-amber-100 text-amber-950"
                    : "border-amber-200 bg-white text-stone-700 hover:border-amber-400"
                }`}
                onClick={() => toggleRecommendation(recommendation)}
              >
                {recommendation}
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-stone-900"
            htmlFor="feedback-criticism"
          >
            Kritik dan saran
          </label>
          <Textarea
            id="feedback-criticism"
            rows={5}
            value={criticism}
            onChange={(event) => setCriticism(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-stone-900"
            htmlFor="feedback-testimonial"
          >
            Testimoni singkat
          </label>
          <Textarea
            id="feedback-testimonial"
            rows={4}
            value={testimonial}
            onChange={(event) => setTestimonial(event.target.value)}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" className="min-h-12 w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Send />}
        {loading ? "Mengirim feedback..." : "Kirim Feedback"}
      </Button>
    </form>
  )
}

function PhotoPreview({
  photo,
  onRemove,
}: {
  photo: PhotoItem
  onRemove: () => void
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border bg-stone-100">
      <LocalImageCanvasPreview
        file={photo.file}
        alt="Preview foto pelanggan"
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm"
        onClick={onRemove}
        aria-label="Hapus foto"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
