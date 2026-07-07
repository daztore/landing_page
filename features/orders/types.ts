export const orderStatuses = [
  "draft",
  "confirmed",
  "waiting_payment",
  "paid",
  "in_production",
  "ready_to_ship",
  "shipped",
  "completed",
  "cancelled",
] as const

export type OrderStatus = (typeof orderStatuses)[number]

export const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  confirmed: "Terkonfirmasi",
  waiting_payment: "Menunggu pembayaran",
  paid: "Dibayar",
  in_production: "Dalam produksi",
  ready_to_ship: "Siap dikirim",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

export const orderStatusDescriptions: Record<OrderStatus, string> = {
  draft: "Order masih disusun admin dan belum menjadi transaksi final.",
  confirmed: "Detail pesanan sudah dikonfirmasi dengan customer.",
  waiting_payment: "Customer sedang menunggu instruksi atau invoice pembayaran manual.",
  paid: "Pembayaran dicatat manual oleh admin.",
  in_production: "Pesanan sedang diproduksi atau disiapkan.",
  ready_to_ship: "Pesanan sudah siap untuk pengiriman atau pengambilan.",
  shipped: "Pesanan sudah dikirim.",
  completed: "Pesanan selesai.",
  cancelled: "Pesanan dibatalkan.",
}

export interface OrderProductSnapshot {
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

export interface CreateOrderItemInput {
  productSlug?: string
  itemName: string
  itemDescription?: string
  quantity: number
  unitPrice: number
  customOptions?: Record<string, string>
  adminNote?: string
}

export interface CreateOrderInput {
  leadId?: string
  customerName: string
  whatsappNumber: string
  email?: string
  eventDate?: string
  dueDate?: string
  discountAmount: number
  adminNote?: string
  items: CreateOrderItemInput[]
}

export interface CreateOrderResult {
  id: string
  orderNumber: string
  publicToken: string
  publicUrl: string
}

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName: string
  whatsappNumber: string
  leadId: string | null
  totalAmount: number
  currency: "IDR"
  createdAt: string
  updatedAt: string
}

export interface AdminOrderItem {
  id: string
  productSlug: string | null
  productSnapshot: OrderProductSnapshot | Record<string, never>
  itemType: "manual" | "catalog"
  itemName: string
  itemDescription: string
  quantity: number
  unitPrice: number
  lineTotal: number
  customOptions: Record<string, unknown>
  adminNote: string
  sortOrder: number
}

export interface AdminOrderStatusHistory {
  id: string
  statusFrom: OrderStatus | null
  statusTo: OrderStatus
  note: string
  createdBy: string | null
  createdAt: string
}

export interface AdminOrderDetail extends AdminOrderListItem {
  email: string
  eventDate: string | null
  dueDate: string | null
  subtotalAmount: number
  discountAmount: number
  publicAccessTokenHint: string
  adminNote: string
  metadata: Record<string, unknown>
  items: AdminOrderItem[]
  histories: AdminOrderStatusHistory[]
}

export interface PublicOrderItem {
  itemName: string
  quantity: number
  lineTotal: number
}

export interface PublicOrderStatusEvent {
  status: OrderStatus
  createdAt: string
}

export interface PublicOrderDetail {
  orderNumber: string
  status: OrderStatus
  customerDisplayName: string
  eventDate: string | null
  dueDate: string | null
  subtotalAmount: number
  discountAmount: number
  totalAmount: number
  currency: "IDR"
  createdAt: string
  items: PublicOrderItem[]
  statusEvents: PublicOrderStatusEvent[]
}
