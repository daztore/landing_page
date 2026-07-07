"use client"

import { Copy, Link2, RefreshCw, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { orderStatusLabels, orderStatuses, type OrderStatus } from "@/features/orders"

interface AdminOrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
}

type ActionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string; publicUrl?: string }
  | { status: "error"; message: string }

export function AdminOrderActions({
  orderId,
  currentStatus,
}: AdminOrderActionsProps) {
  const router = useRouter()
  const [state, setState] = useState<ActionState>({ status: "idle" })
  const loading = state.status === "submitting"

  async function submit(formData: FormData, successMessage: string) {
    setState({ status: "submitting" })

    try {
      const response = await fetch(`/admin-daz/orders/${orderId}/actions`, {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json().catch(() => null)) as {
        error?: string
        publicUrl?: string
      } | null

      if (!response.ok) {
        setState({
          status: "error",
          message: payload?.error ?? "Aksi order gagal diproses.",
        })
        return false
      }

      setState({
        status: "success",
        message: successMessage,
        publicUrl: payload?.publicUrl,
      })
      router.refresh()
      return true
    } catch {
      setState({ status: "error", message: "Koneksi admin bermasalah." })
      return false
    }
  }

  function submitStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(new FormData(event.currentTarget), "Status order diperbarui.")
  }

  function regeneratePublicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(new FormData(event.currentTarget), "Link publik baru dibuat.")
  }

  return (
    <div className="space-y-4">
      {state.status === "success" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p>{state.message}</p>
          {state.publicUrl && (
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(state.publicUrl!)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2 font-semibold text-emerald-900"
            >
              <Copy className="size-4" />
              Salin link publik
            </button>
          )}
        </div>
      )}
      {state.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <form
        onSubmit={submitStatus}
        className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm"
      >
        <input type="hidden" name="action" value="update_status" />
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-1 size-5 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold text-stone-900">
              Status order
            </h2>
            <label htmlFor="order-status" className="mt-3 block text-sm font-medium text-stone-700">
              Pilih status
            </label>
            <select
              id="order-status"
              name="status"
              defaultValue={currentStatus}
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-300"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </select>
            <label htmlFor="status-note" className="mt-3 block text-sm font-medium text-stone-700">
              Catatan perubahan
            </label>
            <textarea
              id="status-note"
              name="note"
              rows={3}
              maxLength={4000}
              disabled={loading}
              className="mt-2 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60 sm:w-auto"
            >
              <Save className="size-4" />
              Simpan status
            </button>
          </div>
        </div>
      </form>

      <form
        onSubmit={regeneratePublicLink}
        className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm"
      >
        <input type="hidden" name="action" value="regenerate_public_link" />
        <div className="flex items-start gap-3">
          <Link2 className="mt-1 size-5 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold text-stone-900">
              Link publik
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Link lama otomatis tidak berlaku setelah link baru dibuat.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 disabled:opacity-60 sm:w-auto"
            >
              <Link2 className="size-4" />
              Buat link baru
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
