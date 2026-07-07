"use client"

import { RefreshCw, Save, StickyNote } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { leadStatusLabels, leadStatuses, type LeadStatus } from "@/features/leads"

interface AdminLeadActionsProps {
  leadId: string
  currentStatus: LeadStatus
}

type ActionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

export function AdminLeadActions({
  leadId,
  currentStatus,
}: AdminLeadActionsProps) {
  const router = useRouter()
  const [state, setState] = useState<ActionState>({ status: "idle" })

  async function submit(formData: FormData, successMessage: string) {
    setState({ status: "submitting" })

    try {
      const response = await fetch(`/admin-daz/leads/${leadId}/actions`, {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setState({
          status: "error",
          message: payload?.error ?? "Aksi lead gagal diproses.",
        })
        return false
      }

      setState({ status: "success", message: successMessage })
      router.refresh()
      return true
    } catch {
      setState({ status: "error", message: "Koneksi admin bermasalah." })
      return false
    }
  }

  function submitStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(new FormData(event.currentTarget), "Status lead diperbarui.")
  }

  function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    void submit(new FormData(form), "Catatan follow-up ditambahkan.").then((ok) => {
      if (ok) {
        form.reset()
      }
    })
  }

  const loading = state.status === "submitting"

  return (
    <div className="space-y-4">
      {state.status === "success" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {state.message}
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
              Status lead
            </h2>
            <div className="mt-3">
              <label htmlFor="lead-status" className="text-sm font-medium text-stone-700">
                Pilih status
              </label>
              <select
                id="lead-status"
                name="status"
                defaultValue={currentStatus}
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              >
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {leadStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label htmlFor="status-note" className="text-sm font-medium text-stone-700">
                Catatan perubahan opsional
              </label>
              <textarea
                id="status-note"
                name="note"
                rows={3}
                maxLength={4000}
                disabled={loading}
                className="mt-2 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
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
        onSubmit={submitNote}
        className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm"
      >
        <input type="hidden" name="action" value="add_note" />
        <div className="flex items-start gap-3">
          <StickyNote className="mt-1 size-5 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold text-stone-900">
              Catatan follow-up
            </h2>
            <label htmlFor="admin-note" className="mt-3 block text-sm font-medium text-stone-700">
              Isi catatan
            </label>
            <textarea
              id="admin-note"
              name="note"
              rows={4}
              maxLength={4000}
              required
              disabled={loading}
              className="mt-2 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 disabled:opacity-60 sm:w-auto"
            >
              <StickyNote className="size-4" />
              Tambah catatan
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
