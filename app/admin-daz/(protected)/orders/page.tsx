import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import Link from "next/link"

import { AdminCard } from "@/components/admin-daz/admin-card"
import {
  orderStatusLabels,
  orderStatuses,
  type OrderStatus,
} from "@/features/orders"
import { isOrderStatus, listAdminOrders } from "@/features/orders/server"
import { requireAdmin } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string
    q?: string
    page?: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

function getPage(value?: string) {
  const page = Number(value ?? "1")
  return Number.isInteger(page) && page > 0 ? page : 1
}

function buildPageHref({
  page,
  status,
  search,
}: {
  page: number
  status?: OrderStatus
  search?: string
}) {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (search) params.set("q", search)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/admin-daz/orders?${query}` : "/admin-daz/orders"
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
      {orderStatusLabels[status]}
    </span>
  )
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const session = await requireAdmin()
  const params = await searchParams
  const selectedStatus = isOrderStatus(params.status) ? params.status : undefined
  const search = String(params.q ?? "").trim().slice(0, 80)
  const page = getPage(params.page)

  let result: Awaited<ReturnType<typeof listAdminOrders>>
  try {
    result = await listAdminOrders(session.client, {
      status: selectedStatus,
      search,
      page,
    })
  } catch (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin-daz/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <AdminCard>
          <h1 className="font-serif text-2xl font-bold">Orders</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Data order belum bisa dimuat. Pastikan migration order sudah dijalankan.
          </p>
          <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-600">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </AdminCard>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin-daz/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <h1 className="mt-3 font-serif text-2xl font-bold">Orders</h1>
          <p className="mt-1 text-sm text-stone-600">
            Order manual dari hasil konsultasi admin.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <AdminCard className="p-3">
            <p className="text-2xl font-bold text-amber-800">{result.total}</p>
            <p className="text-xs text-stone-500">Total sesuai filter</p>
          </AdminCard>
          <Link
            href="/admin-daz/orders/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            <Plus className="size-4" />
            Buat order
          </Link>
        </div>
      </div>

      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm sm:grid-cols-[1fr_190px_auto]"
      >
        <label className="relative">
          <span className="sr-only">Cari order</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Cari nomor, nama, WhatsApp"
            className="h-11 w-full rounded-xl border border-amber-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-amber-300"
          />
        </label>
        <label>
          <span className="sr-only">Filter status</span>
          <select
            name="status"
            defaultValue={selectedStatus ?? ""}
            className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="">Semua status</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {orderStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <button className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800">
          Terapkan
        </button>
      </form>

      {result.orders.length === 0 ? (
        <AdminCard>
          <p className="font-serif text-xl font-semibold">Belum ada order</p>
          <p className="mt-2 text-sm text-stone-600">
            Order manual dari lead atau customer akan tampil di sini.
          </p>
        </AdminCard>
      ) : (
        <div className="grid gap-3">
          {result.orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin-daz/orders/${order.id}`}
              className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-medium text-stone-500">
                      {order.orderNumber}
                    </span>
                  </div>
                  <h2 className="mt-3 truncate font-serif text-xl font-semibold text-stone-900">
                    {order.customerName}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">{order.whatsappNumber}</p>
                  <p className="mt-2 text-sm font-semibold text-amber-900">
                    {currencyFormatter.format(order.totalAmount)}
                  </p>
                </div>
                <p className="text-xs text-stone-500">
                  {dateFormatter.format(new Date(order.createdAt))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={buildPageHref({
            page: Math.max(result.page - 1, 1),
            status: selectedStatus,
            search,
          })}
          aria-disabled={result.page <= 1}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </Link>
        <p className="text-sm text-stone-500">
          Halaman {result.page} dari {result.totalPages}
        </p>
        <Link
          href={buildPageHref({
            page: Math.min(result.page + 1, result.totalPages),
            status: selectedStatus,
            search,
          })}
          aria-disabled={result.page >= result.totalPages}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Berikutnya
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
