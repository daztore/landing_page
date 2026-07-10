import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  orderStatusDescriptions,
  orderStatusLabels,
  type PublicOrderDetail,
} from "@/features/orders"
import {
  getPublicOrderDetail,
  publicOrderAccessCookieName,
} from "@/features/orders/server"

export const dynamic = "force-dynamic"

interface PublicOrderPageProps {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
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

export async function generateMetadata({
  params,
}: PublicOrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params

  return {
    title: `Order ${orderNumber} | daztore.id`,
    referrer: "no-referrer",
    robots: {
      index: false,
      follow: false,
    },
  }
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
      <p className="mt-1 text-sm font-semibold text-stone-800">{value || "-"}</p>
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

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00.000Z`)) : ""
}

function OrderSummary({ order }: { order: PublicOrderDetail }) {
  return (
    <section className="rounded-2xl border border-amber-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            {orderStatusLabels[order.status]}
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold text-stone-950">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {orderStatusDescriptions[order.status]}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
        >
          daztore.id
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <DetailItem label="Customer" value={order.customerDisplayName} />
        <DetailItem label="Tanggal acara" value={formatDate(order.eventDate)} />
        <DetailItem label="Target selesai" value={formatDate(order.dueDate)} />
      </div>
    </section>
  )
}

export default async function PublicOrderPage({
  params,
  searchParams,
}: PublicOrderPageProps) {
  const { orderNumber } = await params
  const query = await searchParams
  const legacyToken = query.token

  if (legacyToken !== undefined) {
    notFound()
  }

  const cookieStore = await cookies()
  const accessCredential = cookieStore.get(publicOrderAccessCookieName)?.value
  const order = await getPublicOrderDetail(orderNumber, accessCredential)

  if (!order) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f8f3eb] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <OrderSummary order={order} />

        <section className="rounded-2xl border border-amber-200/70 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Item order</h2>
          <div className="mt-4 divide-y divide-amber-100">
            {order.items.map((item, index) => (
              <div key={`${item.itemName}-${index}`} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">{item.itemName}</p>
                    <p className="mt-1 text-sm text-stone-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-amber-900">
                    {currencyFormatter.format(item.lineTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200/70 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Total</h2>
          <div className="mt-4 space-y-2 text-sm text-stone-700">
            <AmountRow label="Subtotal" value={order.subtotalAmount} />
            <AmountRow label="Diskon" value={order.discountAmount} />
            <AmountRow label="Total" value={order.totalAmount} strong />
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200/70 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Timeline status</h2>
          <div className="mt-4 space-y-3">
            {order.statusEvents.map((event, index) => (
              <div key={`${event.status}-${index}`} className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-amber-700" />
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {orderStatusLabels[event.status]}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {dateTimeFormatter.format(new Date(event.createdAt))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
