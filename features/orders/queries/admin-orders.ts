import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import {
  orderStatuses,
  type AdminOrderDetail,
  type AdminOrderItem,
  type AdminOrderListItem,
  type AdminOrderStatusHistory,
  type OrderProductSnapshot,
  type OrderStatus,
} from "@/features/orders/types"
import { uuidPattern } from "@/features/orders/validation/order-request"

interface OrderRow {
  id: string
  order_number: string
  lead_id: string | null
  status: OrderStatus
  customer_name: string
  whatsapp_number: string
  email: string | null
  event_date: string | null
  due_date: string | null
  subtotal_amount: number
  discount_amount: number
  total_amount: number
  currency: "IDR"
  public_access_token_hint: string
  admin_note: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface OrderItemRow {
  id: string
  product_slug: string | null
  product_snapshot: OrderProductSnapshot | Record<string, never> | null
  item_type: "manual" | "catalog"
  item_name: string
  item_description: string | null
  quantity: number
  unit_price: number
  line_total: number
  custom_options: Record<string, unknown> | null
  admin_note: string | null
  sort_order: number
}

interface OrderStatusHistoryRow {
  id: string
  status_from: OrderStatus | null
  status_to: OrderStatus
  note: string | null
  created_by: string | null
  created_at: string
}

export interface ListAdminOrdersOptions {
  status?: OrderStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface ListAdminOrdersResult {
  orders: AdminOrderListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function isOrderStatus(value: string | null | undefined): value is OrderStatus {
  return Boolean(value && (orderStatuses as readonly string[]).includes(value))
}

function sanitizeSearch(value: string) {
  return value.replace(/[%_,]/g, " ").trim().slice(0, 80)
}

function mapOrderListItem(row: OrderRow): AdminOrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    customerName: row.customer_name,
    whatsappNumber: row.whatsapp_number,
    leadId: row.lead_id,
    totalAmount: row.total_amount,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapOrderItem(row: OrderItemRow): AdminOrderItem {
  return {
    id: row.id,
    productSlug: row.product_slug,
    productSnapshot: row.product_snapshot ?? {},
    itemType: row.item_type,
    itemName: row.item_name,
    itemDescription: row.item_description ?? "",
    quantity: row.quantity,
    unitPrice: row.unit_price,
    lineTotal: row.line_total,
    customOptions: row.custom_options ?? {},
    adminNote: row.admin_note ?? "",
    sortOrder: row.sort_order,
  }
}

function mapOrderHistory(row: OrderStatusHistoryRow): AdminOrderStatusHistory {
  return {
    id: row.id,
    statusFrom: row.status_from,
    statusTo: row.status_to,
    note: row.note ?? "",
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function mapOrderDetail(
  row: OrderRow,
  items: OrderItemRow[],
  histories: OrderStatusHistoryRow[],
): AdminOrderDetail {
  return {
    ...mapOrderListItem(row),
    email: row.email ?? "",
    eventDate: row.event_date,
    dueDate: row.due_date,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    publicAccessTokenHint: row.public_access_token_hint,
    adminNote: row.admin_note ?? "",
    metadata: row.metadata ?? {},
    items: items.map(mapOrderItem),
    histories: histories.map(mapOrderHistory),
  }
}

export async function listAdminOrders(
  client: SupabaseClient,
  options: ListAdminOrdersOptions = {},
): Promise<ListAdminOrdersResult> {
  const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 50)
  const page = Math.max(options.page ?? 1, 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from("orders")
    .select(
      "id,order_number,lead_id,status,customer_name,whatsapp_number,email,event_date,due_date,subtotal_amount,discount_amount,total_amount,currency,public_access_token_hint,admin_note,metadata,created_at,updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (options.status) {
    query = query.eq("status", options.status)
  }

  const search = sanitizeSearch(options.search ?? "")
  if (search) {
    query = query.or(
      [
        `order_number.ilike.%${search}%`,
        `customer_name.ilike.%${search}%`,
        `whatsapp_number.ilike.%${search}%`,
      ].join(","),
    )
  }

  const { data, error, count } = await query
  if (error) {
    throw new Error(error.message)
  }

  const total = count ?? 0

  return {
    orders: ((data ?? []) as OrderRow[]).map(mapOrderListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getAdminOrderDetail(
  client: SupabaseClient,
  orderId: string,
): Promise<AdminOrderDetail | null> {
  if (!uuidPattern.test(orderId)) {
    return null
  }

  const { data: orderData, error: orderError } = await client
    .from("orders")
    .select(
      "id,order_number,lead_id,status,customer_name,whatsapp_number,email,event_date,due_date,subtotal_amount,discount_amount,total_amount,currency,public_access_token_hint,admin_note,metadata,created_at,updated_at",
    )
    .eq("id", orderId)
    .maybeSingle()

  if (orderError) {
    throw new Error(orderError.message)
  }

  if (!orderData) {
    return null
  }

  const [itemsResult, historiesResult] = await Promise.all([
    client
      .from("order_items")
      .select(
        "id,product_slug,product_snapshot,item_type,item_name,item_description,quantity,unit_price,line_total,custom_options,admin_note,sort_order",
      )
      .eq("order_id", orderId)
      .order("sort_order", { ascending: true }),
    client
      .from("order_status_histories")
      .select("id,status_from,status_to,note,created_by,created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
  ])

  if (itemsResult.error) {
    throw new Error(itemsResult.error.message)
  }

  if (historiesResult.error) {
    throw new Error(historiesResult.error.message)
  }

  return mapOrderDetail(
    orderData as OrderRow,
    (itemsResult.data ?? []) as OrderItemRow[],
    (historiesResult.data ?? []) as OrderStatusHistoryRow[],
  )
}
