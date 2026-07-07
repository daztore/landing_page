"use client"

import { Copy, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

interface AdminOrderProductOption {
  slug: string
  title: string
  categoryName: string
  startPrice: number
  priceLabel: string
}

interface InitialOrderLead {
  id: string
  customerName: string
  whatsappNumber: string
  email: string
  eventDate: string | null
  productSlug: string | null
  productTitle: string
  message: string
}

interface AdminOrderFormProps {
  products: AdminOrderProductOption[]
  initialLead?: InitialOrderLead
}

interface DraftItem {
  key: string
  productSlug: string
  itemName: string
  itemDescription: string
  quantity: number
  unitPrice: number
  customOptions: string
  adminNote: string
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "success"
      orderId: string
      orderNumber: string
      publicUrl: string
    }
  | { status: "error"; message: string }

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

function createDraftItemKey(index: number) {
  return globalThis.crypto?.randomUUID?.() ?? `item-${index}`
}

function createManualItem(name = "Item custom", key = "item-0"): DraftItem {
  return {
    key,
    productSlug: "",
    itemName: name,
    itemDescription: "",
    quantity: 1,
    unitPrice: 0,
    customOptions: "",
    adminNote: "",
  }
}

function getInitialItem(
  products: AdminOrderProductOption[],
  initialLead?: InitialOrderLead,
): DraftItem {
  if (initialLead?.productSlug) {
    const product = products.find((item) => item.slug === initialLead.productSlug)

    if (product) {
      return {
        key: "item-0",
        productSlug: product.slug,
        itemName: product.title,
        itemDescription: "",
        quantity: 1,
        unitPrice: product.startPrice,
        customOptions: initialLead.message,
        adminNote: "",
      }
    }
  }

  return createManualItem(initialLead?.productTitle || "Item custom")
}

export function AdminOrderForm({ products, initialLead }: AdminOrderFormProps) {
  const [customerName, setCustomerName] = useState(initialLead?.customerName ?? "")
  const [whatsappNumber, setWhatsappNumber] = useState(initialLead?.whatsappNumber ?? "")
  const [email, setEmail] = useState(initialLead?.email ?? "")
  const [eventDate, setEventDate] = useState(initialLead?.eventDate ?? "")
  const [dueDate, setDueDate] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [adminNote, setAdminNote] = useState("")
  const [items, setItems] = useState<DraftItem[]>([
    getInitialItem(products, initialLead),
  ])
  const [state, setState] = useState<SubmitState>({ status: "idle" })

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Math.max(item.quantity, 0) * Math.max(Math.trunc(item.unitPrice), 0),
        0,
      ),
    [items],
  )
  const total = Math.max(subtotal - Math.max(discountAmount, 0), 0)
  const loading = state.status === "submitting"

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )
  }

  function selectProduct(key: string, slug: string) {
    const product = products.find((item) => item.slug === slug)

    if (!product) {
      updateItem(key, { productSlug: "", itemName: "", unitPrice: 0 })
      return
    }

    updateItem(key, {
      productSlug: product.slug,
      itemName: product.title,
      unitPrice: product.startPrice,
    })
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: "submitting" })

    try {
      const response = await fetch("/admin-daz/orders/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: initialLead?.id,
          customerName,
          whatsappNumber,
          email,
          eventDate,
          dueDate,
          discountAmount,
          adminNote,
          items: items.map((item) => ({
            productSlug: item.productSlug,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            customOptions: item.customOptions,
            adminNote: item.adminNote,
          })),
        }),
      })
      const payload = (await response.json().catch(() => null)) as {
        error?: string
        order?: {
          id: string
          orderNumber: string
          publicUrl: string
        }
      } | null

      if (!response.ok || !payload?.order) {
        setState({
          status: "error",
          message: payload?.error ?? "Order belum bisa dibuat.",
        })
        return
      }

      setState({
        status: "success",
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        publicUrl: payload.order.publicUrl,
      })
    } catch {
      setState({ status: "error", message: "Koneksi admin bermasalah." })
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {state.status === "success" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Order draft {state.orderNumber} berhasil dibuat.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/admin-daz/orders/${state.orderId}`}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white"
            >
              Buka detail order
            </Link>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(state.publicUrl)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 font-semibold text-emerald-900"
            >
              <Copy className="size-4" />
              Salin link publik
            </button>
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.message}
        </div>
      )}

      {initialLead && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Order dibuat dari lead{" "}
          <Link href={`/admin-daz/leads/${initialLead.id}`} className="font-semibold underline">
            {initialLead.customerName}
          </Link>
          .
        </div>
      )}

      <section className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Customer</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-stone-700">
            Nama
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              maxLength={120}
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            WhatsApp
            <input
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              required
              maxLength={24}
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              maxLength={160}
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Tanggal acara
            <input
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              type="date"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Target selesai
            <input
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              type="date"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Item order</h2>
          <button
            type="button"
            onClick={() =>
              setItems((current) => [
                ...current,
                createManualItem("Item custom", createDraftItemKey(current.length)),
              ])
            }
            disabled={loading || items.length >= 20}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-60"
          >
            <Plus className="size-4" />
            Tambah
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-stone-800">Item {index + 1}</p>
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      current.length > 1
                        ? current.filter((currentItem) => currentItem.key !== item.key)
                        : current,
                    )
                  }
                  disabled={loading || items.length <= 1}
                  className="inline-flex size-9 items-center justify-center rounded-xl text-red-700 disabled:opacity-40"
                  aria-label="Hapus item"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-stone-700">
                  Produk katalog
                  <select
                    value={item.productSlug}
                    onChange={(event) => selectProduct(item.key, event.target.value)}
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-xl border border-amber-200 bg-white px-3 outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option value="">Item manual</option>
                    {products.map((product) => (
                      <option key={product.slug} value={product.slug}>
                        {product.title} - {product.priceLabel}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-stone-700">
                  Nama item
                  <input
                    value={item.itemName}
                    onChange={(event) => updateItem(item.key, { itemName: event.target.value })}
                    required
                    maxLength={160}
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
                <label className="text-sm font-medium text-stone-700">
                  Quantity
                  <input
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.key, { quantity: Number(event.target.value) })
                    }
                    type="number"
                    min={1}
                    max={99}
                    required
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
                <label className="text-sm font-medium text-stone-700">
                  Harga satuan
                  <input
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.key, { unitPrice: Number(event.target.value) })
                    }
                    type="number"
                    min={0}
                    required
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
              </div>

              <label className="mt-3 block text-sm font-medium text-stone-700">
                Opsi custom
                <textarea
                  value={item.customOptions}
                  onChange={(event) => updateItem(item.key, { customOptions: event.target.value })}
                  rows={2}
                  maxLength={1000}
                  disabled={loading}
                  className="mt-2 w-full resize-none rounded-xl border border-amber-200 px-3 py-3 outline-none focus:ring-2 focus:ring-amber-300"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-stone-700">
                Catatan admin item
                <textarea
                  value={item.adminNote}
                  onChange={(event) => updateItem(item.key, { adminNote: event.target.value })}
                  rows={2}
                  maxLength={4000}
                  disabled={loading}
                  className="mt-2 w-full resize-none rounded-xl border border-amber-200 px-3 py-3 outline-none focus:ring-2 focus:ring-amber-300"
                />
              </label>
              <p className="mt-3 text-sm font-semibold text-amber-900">
                Subtotal item: {currencyFormatter.format(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Total</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-stone-700">
            Diskon manual
            <input
              value={discountAmount}
              onChange={(event) => setDiscountAmount(Number(event.target.value))}
              type="number"
              min={0}
              max={subtotal}
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl border border-amber-200 px-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Catatan order
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={3}
              maxLength={4000}
              disabled={loading}
              className="mt-2 w-full resize-none rounded-xl border border-amber-200 px-3 py-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-2 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
          <div className="flex justify-between gap-3">
            <span>Subtotal</span>
            <strong>{currencyFormatter.format(subtotal)}</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span>Diskon</span>
            <strong>{currencyFormatter.format(discountAmount)}</strong>
          </div>
          <div className="flex justify-between gap-3 text-base text-stone-950">
            <span>Total draft</span>
            <strong>{currencyFormatter.format(total)}</strong>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60 sm:w-auto"
      >
        <Save className="size-4" />
        {loading ? "Menyimpan..." : "Buat order draft"}
      </button>
    </form>
  )
}
