import type { CreateOrderInput, CreateOrderItemInput } from "@/features/orders/types"

export const adminOrderRequestMaxBytes = 64 * 1024

export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const orderNumberPattern = /^DZT-[0-9]{8}-[0-9]{5,}$/i

export const publicOrderTokenPattern = /^[A-Za-z0-9_-]{24,160}$/

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function getRecord(value: unknown, message: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message)
  }

  return value as Record<string, unknown>
}

function getString(
  record: Record<string, unknown>,
  key: string,
  maxLength: number,
  options: { required?: boolean; label: string },
) {
  const value = String(record[key] ?? "").trim().slice(0, maxLength)

  if (options.required && !value) {
    throw new Error(`${options.label} wajib diisi.`)
  }

  return value
}

function getOptionalDate(record: Record<string, unknown>, key: string, label: string) {
  const value = getString(record, key, 10, { label })

  if (!value) {
    return undefined
  }

  if (!datePattern.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new Error(`${label} tidak valid.`)
  }

  return value
}

function getInteger(
  record: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
  label: string,
) {
  const raw = record[key]
  const value = typeof raw === "number" ? raw : Number(String(raw ?? "").trim())

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} tidak valid.`)
  }

  return value
}

function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "")

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`
  }

  return digits
}

function parseCustomOptions(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const note = value.trim().slice(0, 1000)

  return note ? { note } : undefined
}

function parseOrderItem(value: unknown, index: number): CreateOrderItemInput {
  const item = getRecord(value, `Item order #${index + 1} tidak valid.`)
  const productSlug = getString(item, "productSlug", 80, {
    label: `Slug produk item #${index + 1}`,
  })

  if (productSlug && !productSlugPattern.test(productSlug)) {
    throw new Error(`Slug produk item #${index + 1} tidak valid.`)
  }

  const itemName = getString(item, "itemName", 160, {
    required: true,
    label: `Nama item #${index + 1}`,
  })

  if (itemName.length < 2) {
    throw new Error(`Nama item #${index + 1} terlalu pendek.`)
  }

  const itemDescription = getString(item, "itemDescription", 1000, {
    label: `Deskripsi item #${index + 1}`,
  })
  const adminNote = getString(item, "adminNote", 4000, {
    label: `Catatan item #${index + 1}`,
  })

  return {
    productSlug: productSlug || undefined,
    itemName,
    itemDescription: itemDescription || undefined,
    quantity: getInteger(item, "quantity", 1, 99, `Jumlah item #${index + 1}`),
    unitPrice: getInteger(item, "unitPrice", 0, 1_000_000_000, `Harga item #${index + 1}`),
    customOptions: parseCustomOptions(item.customOptions),
    adminNote: adminNote || undefined,
  }
}

export function parseCreateOrderRequestBody(body: unknown): CreateOrderInput {
  const record = getRecord(body, "Payload order tidak valid.")
  const leadId = getString(record, "leadId", 36, { label: "Lead" })

  if (leadId && !uuidPattern.test(leadId)) {
    throw new Error("Lead tidak valid.")
  }

  const customerName = getString(record, "customerName", 120, {
    required: true,
    label: "Nama customer",
  })

  if (customerName.length < 2) {
    throw new Error("Nama customer terlalu pendek.")
  }

  const whatsappNumber = normalizeWhatsAppNumber(
    getString(record, "whatsappNumber", 24, {
      required: true,
      label: "Nomor WhatsApp",
    }),
  )

  if (!/^[0-9]{10,16}$/.test(whatsappNumber)) {
    throw new Error("Nomor WhatsApp tidak valid.")
  }

  const email = getString(record, "email", 160, { label: "Email" })

  if (email && !emailPattern.test(email)) {
    throw new Error("Email tidak valid.")
  }

  const rawItems = Array.isArray(record.items) ? record.items : []

  if (rawItems.length < 1 || rawItems.length > 20) {
    throw new Error("Order wajib memiliki 1 sampai 20 item.")
  }

  const items = rawItems.map(parseOrderItem)
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount = getInteger(record, "discountAmount", 0, 1_000_000_000, "Diskon")

  if (discountAmount > subtotal) {
    throw new Error("Diskon tidak boleh melebihi subtotal.")
  }

  const adminNote = getString(record, "adminNote", 4000, { label: "Catatan order" })

  return {
    leadId: leadId || undefined,
    customerName,
    whatsappNumber,
    email: email || undefined,
    eventDate: getOptionalDate(record, "eventDate", "Tanggal acara"),
    dueDate: getOptionalDate(record, "dueDate", "Target selesai"),
    discountAmount,
    adminNote: adminNote || undefined,
    items,
  }
}
