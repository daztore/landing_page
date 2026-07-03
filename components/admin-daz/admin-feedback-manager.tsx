"use client"

import Image from "next/image"
import { useMemo, useState, type FormEvent } from "react"
import {
  Check,
  Clipboard,
  Copy,
  ImagePlus,
  Loader2,
  RefreshCw,
  Star,
} from "lucide-react"

import { AdminCard } from "@/components/admin-daz/admin-card"
import { AdminFormField } from "@/components/admin-daz/admin-form-field"
import { LocalImageCanvasPreview } from "@/components/shared/local-image-canvas-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AdminFeedbackRequest } from "@/lib/admin-daz/feedback-service"
import { feedbackProductCategories } from "@/lib/feedback/constants"
import { getFeedbackImageValidationError } from "@/lib/feedback/storage"
import { getPublicImageUrl } from "@/lib/admin-daz/storage-service"
import { optimizeImageFile } from "@/lib/images/compress"
import { getSafeImageSrc } from "@/lib/security/safe-image-src"

function feedbackUrl(id: string) {
  if (typeof window === "undefined") {
    return `/feedback/${id}`
  }

  return `${window.location.origin}/feedback/${id}`
}

function formatDate(value: string | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function statusLabel(status: AdminFeedbackRequest["status"]) {
  if (status === "submitted") {
    return "Terkirim"
  }
  if (status === "expired") {
    return "Expired"
  }
  return "Pending"
}

function statusClass(status: AdminFeedbackRequest["status"]) {
  if (status === "submitted") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800"
  }
  if (status === "expired") {
    return "border-stone-200 bg-stone-100 text-stone-600"
  }
  return "border-amber-200 bg-amber-50 text-amber-800"
}

export function AdminFeedbackManager({
  initialRequests,
}: {
  initialRequests: AdminFeedbackRequest[]
}) {
  const [requests, setRequests] =
    useState<AdminFeedbackRequest[]>(initialRequests)
  const [customerName, setCustomerName] = useState("")
  const [productName, setProductName] = useState("")
  const [productCategory, setProductCategory] = useState<string>(
    feedbackProductCategories[0].value,
  )
  const [productDescription, setProductDescription] = useState("")
  const [productPhoto, setProductPhoto] = useState<File | null>(null)
  const [createdRequestId, setCreatedRequestId] = useState("")
  const [copiedId, setCopiedId] = useState("")
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const createdLink = useMemo(
    () => (createdRequestId ? feedbackUrl(createdRequestId) : ""),
    [createdRequestId],
  )

  async function selectProductPhoto(file?: File) {
    setError("")

    if (!file) {
      setProductPhoto(null)
      return
    }

    const validationError = getFeedbackImageValidationError(file)
    if (validationError) {
      setProductPhoto(null)
      setError(validationError)
      return
    }

    const optimizedFile = await optimizeImageFile(file, {
      maxWidth: 1600,
      quality: 0.82,
    })
    const optimizedValidationError = getFeedbackImageValidationError(optimizedFile)
    if (optimizedValidationError) {
      setProductPhoto(null)
      setError(optimizedValidationError)
      return
    }

    setProductPhoto(optimizedFile)
  }

  function resetForm() {
    setCustomerName("")
    setProductName("")
    setProductCategory(feedbackProductCategories[0].value)
    setProductDescription("")
    setProductPhoto(null)
  }

  async function refreshRequests() {
    setRefreshing(true)
    setError("")

    try {
      const response = await fetch("/admin-daz/feedback/requests", {
        method: "GET",
      })
      const payload = (await response.json()) as {
        requests?: AdminFeedbackRequest[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Gagal memuat request feedback.")
      }

      setRequests(payload.requests ?? [])
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Gagal memuat request feedback.",
      )
    } finally {
      setRefreshing(false)
    }
  }

  async function copyLink(id: string) {
    const link = feedbackUrl(id)

    await navigator.clipboard.writeText(link)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(""), 1600)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setNotice("")
    setCreatedRequestId("")

    try {
      if (!productPhoto) {
        throw new Error("Foto produk wajib diunggah.")
      }

      const formData = new FormData()
      formData.append("customerName", customerName)
      formData.append("productName", productName)
      formData.append("productCategory", productCategory)
      formData.append("productDescription", productDescription)
      formData.append("productPhoto", productPhoto)

      const response = await fetch("/admin-daz/feedback/requests", {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json()) as {
        request?: AdminFeedbackRequest
        error?: string
      }

      if (!response.ok || !payload.request) {
        throw new Error(payload.error ?? "Gagal membuat request feedback.")
      }

      setRequests((current) => [payload.request!, ...current])
      setCreatedRequestId(payload.request.id)
      setNotice("Request feedback berhasil dibuat.")
      resetForm()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal membuat request feedback.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Feedback Pelanggan</h1>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Buat link feedback unik, simpan produk sebagai draft non-publik, dan
          pantau hasil feedback pelanggan.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {createdLink && (
        <AdminCard className="border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-900">
            Link feedback siap dibagikan.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={createdLink} className="min-h-11 bg-white" />
            <Button
              type="button"
              className="min-h-11"
              onClick={() => void copyLink(createdRequestId)}
            >
              {copiedId === createdRequestId ? <Check /> : <Copy />}
              {copiedId === createdRequestId ? "Tersalin" : "Copy"}
            </Button>
          </div>
        </AdminCard>
      )}

      <AdminCard>
        <div className="mb-5">
          <h2 className="font-semibold">Buat Request Feedback</h2>
          <p className="mt-1 text-xs text-stone-500">
            Field bertanda bintang wajib diisi.
          </p>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Nama pelanggan"
              htmlFor="feedback-customer-name"
              required
            >
              <Input
                id="feedback-customer-name"
                required
                className="min-h-11"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </AdminFormField>

            <AdminFormField
              label="Nama produk"
              htmlFor="feedback-product-name"
              required
            >
              <Input
                id="feedback-product-name"
                required
                className="min-h-11"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            </AdminFormField>
          </div>

          <AdminFormField
            label="Kategori produk"
            htmlFor="feedback-product-category"
            required
          >
            <select
              id="feedback-product-category"
              required
              value={productCategory}
              onChange={(event) => setProductCategory(event.target.value)}
              className="min-h-11 w-full rounded-md border border-input bg-white px-3 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 md:text-sm"
            >
              {feedbackProductCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField
            label="Deskripsi singkat produk"
            htmlFor="feedback-product-description"
          >
            <Textarea
              id="feedback-product-description"
              rows={4}
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
            />
          </AdminFormField>

          <AdminFormField
            label="Foto produk"
            htmlFor="feedback-product-photo"
            required
            helpText="JPEG, PNG, atau WebP. Maksimal 5 MB, otomatis dioptimalkan."
          >
            <div className="space-y-3 rounded-xl border bg-stone-50 p-3">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed bg-white text-sm text-stone-400">
                <LocalImageCanvasPreview
                  file={productPhoto}
                  alt="Preview foto produk"
                  className="h-full w-full object-cover"
                  placeholder={<span>Belum ada gambar</span>}
                />
              </div>
              <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400 bg-white px-4 text-sm font-semibold text-stone-700">
                <ImagePlus className="size-4" />
                Pilih gambar
                <input
                  id="feedback-product-photo"
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    void selectProductPhoto(event.target.files?.[0])
                  }
                />
              </label>
              {productPhoto && (
                <p className="truncate text-xs text-stone-500">
                  File: {productPhoto.name}
                </p>
              )}
            </div>
          </AdminFormField>

          <Button type="submit" className="min-h-11 w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Clipboard />}
            {loading ? "Membuat request..." : "Buat Link Feedback"}
          </Button>
        </form>
      </AdminCard>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">Request Terbaru</h2>
          <p className="mt-1 text-sm text-stone-600">
            Feedback yang sudah dikirim akan tampil di daftar ini.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => void refreshRequests()}
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Muat ulang</span>
        </Button>
      </div>

      {requests.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-stone-500">Belum ada request feedback.</p>
        </AdminCard>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {requests.map((item) => {
            const productImage = getSafeImageSrc(
              getPublicImageUrl("catalogs", item.productPhotoUrl),
            )

            return (
              <AdminCard key={item.id}>
                {productImage && (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-xl border bg-stone-100">
                    <Image
                      src={productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.customerName} - {item.productCategoryLabel}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      Dibuat {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                      item.status,
                    )}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Input
                    readOnly
                    value={feedbackUrl(item.id)}
                    className="min-h-10 bg-stone-50 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10"
                    onClick={() => void copyLink(item.id)}
                  >
                    {copiedId === item.id ? <Check /> : <Copy />}
                    {copiedId === item.id ? "Tersalin" : "Copy"}
                  </Button>
                </div>

                {item.submission && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="flex items-center gap-1 text-amber-600">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`size-4 ${
                            index < item.submission!.rating
                              ? "fill-current"
                              : "text-stone-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-stone-500">
                        {formatDate(item.submission.createdAt)}
                      </span>
                    </div>

                    {item.submission.testimonial && (
                      <p className="text-sm leading-6 text-stone-700">
                        {item.submission.testimonial}
                      </p>
                    )}
                    {item.submission.criticism && (
                      <p className="text-sm leading-6 text-stone-600">
                        {item.submission.criticism}
                      </p>
                    )}

                    {item.submission.recommendations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.submission.recommendations.map((recommendation) => (
                          <span
                            key={recommendation}
                            className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900"
                          >
                            {recommendation}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.submission.customerPhotoUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {item.submission.customerPhotoUrls.map((path) => {
                          const image = getSafeImageSrc(path)

                          return image ? (
                            <div
                              key={path}
                              className="relative aspect-square overflow-hidden rounded-lg border bg-stone-100"
                            >
                              <img
                                src={image}
                                alt="Foto feedback pelanggan"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                )}
              </AdminCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
