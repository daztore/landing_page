import { ArrowLeft, CalendarDays, Link2, PackageCheck, UserRound } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminCard } from "@/components/admin-daz/admin-card"
import { AdminOrderActions } from "@/features/orders/components/admin-order-actions"
import {
  orderStatusDescriptions,
  orderStatusLabels,
  type AdminOrderDetail,
  type OrderProductSnapshot,
} from "@/features/orders"
import { getAdminOrderDetail } from "@/features/orders/server"
import { requireAdmin } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>
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

function getProductSnapshot(snapshot: AdminOrderDetail["items"][number]["productSnapshot"]) {
  return snapshot && "title" in snapshot ? (snapshot as OrderProductSnapshot) : null
}

function getCustomOptionNote(customOptions: Record<string, unknown>) {
  return typeof customOptions.note === "string" ? customOptions.note : ""
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-stone-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-stone-800">{value || "-"}</p>
    </div>
  )
}

function AmountRow({
  label,
  value,
  strong,
}: {
  label: string
  value: number
  strong?: boolean
}) {
  return (
    <div className={strong ? "flex justify-between gap-3 text-base" : "flex justify-between gap-3"}>
      <span>{label}</span>
      <strong>{currencyFormatter.format(value)}</strong>
    </div>
  )
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params
  const session = await requireAdmin()

  let order: AdminOrderDetail | null = null
  try {
    order = await getAdminOrderDetail(session.client, id)
  } catch (error) {
    return (
      <AdminCard>
        <Link
          href="/admin-daz/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
        >
          <ArrowLeft className="size-4" />
          Orders
        </Link>
        <h1 className="mt-4 font-serif text-2xl font-bold">Order belum bisa dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Pastikan migration order sudah dijalankan.
        </p>
        <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-600">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </AdminCard>
    )
  }

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin-daz/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
      >
        <ArrowLeft className="size-4" />
        Orders
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <AdminCard>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  {orderStatusLabels[order.status]}
                </span>
                <h1 className="mt-3 font-serif text-2xl font-bold">{order.orderNumber}</h1>
                <p className="mt-1 text-sm text-stone-600">
                  {dateFormatter.format(new Date(order.createdAt))}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {orderStatusDescriptions[order.status]}
                </p>
              </div>
              <Link
                href={`/admin-daz/orders/new${order.leadId ? `?leadId=${order.leadId}` : ""}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
              >
                <PackageCheck className="size-4" />
                Buat order baru
              </Link>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-start gap-3">
              <UserRound className="mt-1 size-5 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-semibold">Customer</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Nama" value={order.customerName} />
                  <DetailItem label="WhatsApp" value={order.whatsappNumber} />
                  <DetailItem label="Email" value={order.email} />
                  <DetailItem label="Tanggal acara" value={order.eventDate ?? ""} />
                  <DetailItem label="Target selesai" value={order.dueDate ?? ""} />
                  <div>
                    <p className="text-xs font-medium uppercase text-stone-400">Lead</p>
                    {order.leadId ? (
                      <Link
                        href={`/admin-daz/leads/${order.leadId}`}
                        className="mt-1 inline-flex text-sm font-semibold text-amber-800 underline"
                      >
                        Buka lead
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-stone-800">Manual</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="font-serif text-xl font-semibold">Item order</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => {
                const snapshot = getProductSnapshot(item.productSnapshot)
                const customNote = getCustomOptionNote(item.customOptions)

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-serif text-lg font-semibold text-stone-900">
                          {item.itemName}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase text-stone-500">
                          {item.itemType === "catalog" ? "Katalog" : "Manual"}
                        </p>
                        {snapshot && (
                          <p className="mt-2 text-sm text-stone-600">
                            Snapshot: {snapshot.title} - {snapshot.category.name}
                          </p>
                        )}
                        {item.itemDescription && (
                          <p className="mt-2 text-sm leading-6 text-stone-700">
                            {item.itemDescription}
                          </p>
                        )}
                        {customNote && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                            Opsi: {customNote}
                          </p>
                        )}
                        {item.adminNote && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                            Catatan: {item.adminNote}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-stone-700 sm:text-right">
                        <p>
                          {item.quantity} x {currencyFormatter.format(item.unitPrice)}
                        </p>
                        <p className="mt-1 font-semibold text-amber-900">
                          {currencyFormatter.format(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </AdminCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <AdminCard>
              <h2 className="font-serif text-xl font-semibold">Total order</h2>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                <AmountRow label="Subtotal" value={order.subtotalAmount} />
                <AmountRow label="Diskon" value={order.discountAmount} />
                <AmountRow label="Total" value={order.totalAmount} strong />
              </div>
              {order.adminNote && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                  {order.adminNote}
                </p>
              )}
            </AdminCard>

            <AdminCard>
              <div className="flex items-start gap-3">
                <Link2 className="mt-1 size-5 shrink-0 text-amber-700" />
                <div>
                  <h2 className="font-serif text-xl font-semibold">Akses publik</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Token tersimpan sebagai hash. Hint token saat ini:{" "}
                    <span className="font-semibold">{order.publicAccessTokenHint || "-"}</span>
                  </p>
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminCard>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 size-5 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-semibold">History status</h2>
                <div className="mt-4 space-y-3">
                  {order.histories.length === 0 ? (
                    <p className="text-sm text-stone-600">Belum ada history status.</p>
                  ) : (
                    order.histories.map((history) => (
                      <div
                        key={history.id}
                        className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span>{dateFormatter.format(new Date(history.createdAt))}</span>
                          <span>-</span>
                          <span>{orderStatusLabels[history.statusTo]}</span>
                        </div>
                        {history.note && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                            {history.note}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <AdminOrderActions orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  )
}
