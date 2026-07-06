import {
  leadBudgetRanges,
  leadSources,
  type CreateLeadInput,
  type LeadSource,
} from "@/features/leads/types"

export const leadConsentText =
  "Saya setuju data kontak ini digunakan oleh daztore.id untuk follow-up konsultasi terkait produk yang saya minati."

export const leadRequestMaxBytes = 16 * 1024

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ParseResult =
  | { ok: true; input: CreateLeadInput }
  | { ok: false; message: string; status?: number }

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function getText(body: Record<string, unknown>, key: string, maxLength: number) {
  const value = body[key]
  if (typeof value !== "string") {
    return ""
  }

  return value.trim().slice(0, maxLength)
}

export function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "")

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`
  }

  if (digits.startsWith("8")) {
    return `62${digits}`
  }

  return digits
}

function isLeadSource(value: string): value is LeadSource {
  return (leadSources as readonly string[]).includes(value)
}

function parseEventDate(value: string) {
  if (!value) {
    return undefined
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return value
}

export function parseCreateLeadRequestBody(body: unknown, now = Date.now()): ParseResult {
  const record = getRecord(body)
  if (!record) {
    return { ok: false, message: "Format inquiry tidak valid." }
  }

  const honeypot = getText(record, "website", 200) || getText(record, "company", 200)
  if (honeypot) {
    return { ok: false, message: "Inquiry belum bisa diproses." }
  }

  const formStartedAtRaw = record.formStartedAt
  if (typeof formStartedAtRaw === "number" || typeof formStartedAtRaw === "string") {
    const formStartedAt = Number(formStartedAtRaw)
    if (Number.isFinite(formStartedAt)) {
      const elapsed = now - formStartedAt
      if (elapsed >= 0 && elapsed < 2500) {
        return { ok: false, message: "Inquiry belum bisa diproses. Silakan coba lagi." }
      }
    }
  }

  const sourceValue = getText(record, "source", 40) || "product_detail"
  if (!isLeadSource(sourceValue)) {
    return { ok: false, message: "Sumber inquiry tidak valid." }
  }

  const customerName = getText(record, "name", 120)
  if (customerName.length < 2) {
    return { ok: false, message: "Nama wajib diisi minimal 2 karakter." }
  }

  const whatsappNumber = normalizeWhatsAppNumber(getText(record, "whatsappNumber", 40))
  if (!/^[0-9]{10,16}$/.test(whatsappNumber)) {
    return { ok: false, message: "Nomor WhatsApp tidak valid." }
  }

  const email = getText(record, "email", 160)
  if (email && !emailPattern.test(email)) {
    return { ok: false, message: "Email tidak valid." }
  }

  const productSlug = getText(record, "productSlug", 120)
  if (productSlug && !productSlugPattern.test(productSlug)) {
    return { ok: false, message: "Produk yang dipilih tidak valid." }
  }

  const interestCategory = getText(record, "interestCategory", 120)
  if (!productSlug && !interestCategory) {
    return { ok: false, message: "Pilih produk atau isi minat produk terlebih dahulu." }
  }

  const eventDate = parseEventDate(getText(record, "eventDate", 20))
  if (eventDate === null) {
    return { ok: false, message: "Tanggal acara tidak valid." }
  }

  const budgetRange = getText(record, "budgetRange", 80)
  if (budgetRange && !(leadBudgetRanges as readonly string[]).includes(budgetRange)) {
    return { ok: false, message: "Range budget tidak valid." }
  }

  const message = getText(record, "message", 1000)
  const consentAccepted = record.consentAccepted === true
  if (!consentAccepted) {
    return { ok: false, message: "Persetujuan penggunaan data wajib dicentang." }
  }

  const sourceUrl = getText(record, "sourceUrl", 300)

  return {
    ok: true,
    input: {
      source: sourceValue,
      customerName,
      whatsappNumber,
      email: email || undefined,
      productSlug: productSlug || undefined,
      interestCategory: interestCategory || undefined,
      eventDate: eventDate || undefined,
      budgetRange: budgetRange || undefined,
      message: message || undefined,
      consentAccepted: true,
      consentText: leadConsentText,
      metadata: {
        sourceUrl: sourceUrl || undefined,
      },
    },
  }
}
