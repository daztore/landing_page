"use client"

import { useEffect, useState } from "react"
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react"

import { AdminConfirmDialog } from "@/components/admin-daz/admin-confirm-dialog"
import { AdminImagePreview } from "@/components/admin-daz/admin-image-preview"
import { Button } from "@/components/ui/button"
import {
  deleteAdminImage,
  getAdminImageValidationError,
  uploadAdminImage,
} from "@/lib/admin-daz/storage-service"
import type { StorageBucket } from "@/lib/supabase/storage"

export function AdminImageUploader({
  bucket,
  folder,
  value,
  onChange,
}: {
  bucket: StorageBucket
  folder: string
  value?: string | null
  onChange: (path: string) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [deleteOldAfterReplace, setDeleteOldAfterReplace] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function selectFile(nextFile?: File) {
    setError("")
    if (!nextFile) {
      setFile(null)
      setPreviewUrl("")
      return
    }

    const validationError = getAdminImageValidationError(nextFile)
    if (validationError) {
      setFile(null)
      setPreviewUrl("")
      setError(validationError)
      return
    }

    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
  }

  async function upload() {
    if (!file) {
      return
    }

    setUploading(true)
    setError("")
    try {
      const previousPath = value || ""
      const path = await uploadAdminImage(bucket, folder, file)
      onChange(path)
      setFile(null)
      setPreviewUrl("")

      if (
        deleteOldAfterReplace &&
        previousPath &&
        !previousPath.startsWith("/") &&
        !/^https?:\/\//i.test(previousPath)
      ) {
        await deleteAdminImage(bucket, previousPath)
      }
    } catch (uploadError) {
      console.error("Admin image upload failed:", uploadError)
      setError("Gagal upload gambar. Coba gunakan gambar lain atau refresh halaman.")
    } finally {
      setUploading(false)
    }
  }

  async function deleteStoredFile() {
    if (!value) {
      return
    }
    setError("")
    try {
      await deleteAdminImage(bucket, value)
      onChange("")
    } catch (deleteError) {
      console.error("Admin image deletion failed:", deleteError)
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Gagal menghapus gambar.",
      )
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-stone-50 p-3">
      <AdminImagePreview bucket={bucket} path={value} previewUrl={previewUrl} />
      <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400 bg-white px-4 text-sm font-semibold text-stone-700">
        <ImagePlus className="size-4" />
        Pilih gambar
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
      </label>
      <p className="text-xs text-stone-500">JPEG, PNG, atau WebP. Maksimal 5 MB.</p>

      {file && (
        <>
          {value && (
            <label className="flex items-start gap-2 text-xs text-stone-600">
              <input
                className="mt-0.5 size-4"
                type="checkbox"
                checked={deleteOldAfterReplace}
                onChange={(event) => setDeleteOldAfterReplace(event.target.checked)}
              />
              Hapus file lama dari Storage setelah upload pengganti berhasil.
            </label>
          )}
          <Button
            className="min-h-11 w-full"
            type="button"
            disabled={uploading}
            onClick={() => void upload()}
          >
            {uploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Upload />
            )}
            {uploading ? "Mengunggah..." : "Upload gambar"}
          </Button>
          {uploading && (
            <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-amber-500" />
            </div>
          )}
        </>
      )}

      {value && !file && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => onChange("")}
          >
            Lepas referensi
          </Button>
          <AdminConfirmDialog
            title="Hapus file dari Storage?"
            description="File akan dihapus permanen dan referensi form dikosongkan."
            confirmLabel="Hapus file"
            onConfirm={deleteStoredFile}
            trigger={
              <Button type="button" variant="destructive" className="min-h-11">
                <Trash2 />
                Hapus file
              </Button>
            }
          />
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {value && <p className="break-all text-xs text-stone-500">Path: {value}</p>}
    </div>
  )
}
