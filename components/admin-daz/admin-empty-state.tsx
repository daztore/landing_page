import { Inbox } from "lucide-react"

export function AdminEmptyState({
  title = "Belum ada data",
  description = "Tambahkan data pertama untuk mulai mengelola konten.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <Inbox className="mx-auto mb-3 size-9 text-stone-400" aria-hidden="true" />
      <h2 className="font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  )
}
