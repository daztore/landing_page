export const leadStatuses = [
  "new",
  "contacted",
  "quoted",
  "converted",
  "cancelled",
] as const

export type LeadStatus = (typeof leadStatuses)[number]

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Baru",
  contacted: "Sudah dihubungi",
  quoted: "Sudah diberi estimasi",
  converted: "Menjadi order manual",
  cancelled: "Dibatalkan",
}

export const leadSources = [
  "product_detail",
  "catalog",
  "landing",
  "admin_manual",
] as const

export type LeadSource = (typeof leadSources)[number]

export const leadSourceLabels: Record<LeadSource, string> = {
  product_detail: "Detail produk",
  catalog: "Katalog",
  landing: "Landing page",
  admin_manual: "Input admin",
}

export const leadBudgetRanges = [
  "Belum tahu",
  "Di bawah Rp3.000.000",
  "Rp3.000.000 - Rp5.000.000",
  "Rp5.000.000 - Rp10.000.000",
  "Rp10.000.000 - Rp20.000.000",
  "Di atas Rp20.000.000",
] as const

export interface LeadProductSnapshot {
  slug: string
  title: string
  category: {
    slug: string
    name: string
  }
  price: {
    start: number
    end?: number
    label: string
    isEstimate: true
  }
  imageUrl?: string
  processingTime?: string
  customizable?: boolean
  available?: boolean
}

export interface CreateLeadInput {
  source: LeadSource
  customerName: string
  whatsappNumber: string
  email?: string
  productSlug?: string
  interestCategory?: string
  eventDate?: string
  budgetRange?: string
  message?: string
  consentAccepted: true
  consentText: string
  metadata: {
    sourceUrl?: string
    userAgent?: string
  }
}

export interface CreateLeadResult {
  id: string
}

export interface AdminLeadListItem {
  id: string
  source: LeadSource
  status: LeadStatus
  customerName: string
  whatsappNumber: string
  productSlug: string | null
  productTitle: string
  interestCategory: string
  createdAt: string
  lastContactedAt: string | null
}

export interface AdminLeadMessage {
  id: string
  messageType: "customer_message" | "admin_note" | "status_change" | "system"
  channel: "form" | "whatsapp" | "phone" | "email" | "admin" | "system"
  body: string
  statusFrom: LeadStatus | null
  statusTo: LeadStatus | null
  createdBy: string | null
  createdAt: string
}

export interface AdminLeadDetail extends AdminLeadListItem {
  email: string
  eventDate: string | null
  budgetRange: string
  message: string
  productSnapshot: LeadProductSnapshot | Record<string, never>
  consentAccepted: boolean
  consentText: string
  metadata: Record<string, unknown>
  messages: AdminLeadMessage[]
}
