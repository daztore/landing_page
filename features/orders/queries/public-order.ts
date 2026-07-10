import "server-only"

import type { OrderStatus, PublicOrderDetail, PublicOrderItem } from "@/features/orders/types"
import {
  orderNumberPattern,
  publicOrderTokenPattern,
} from "@/features/orders/validation/order-request"
import { hasValidPublicOrderAccess } from "@/features/orders/services/public-access"
import {
  publicOrderAccessMaximumCredentialLength,
  publicOrderTokenMatches,
} from "@/features/orders/services/public-access-crypto"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"

interface PublicOrderRow {
  id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  event_date: string | null
  due_date: string | null
  subtotal_amount: number
  discount_amount: number
  total_amount: number
  currency: "IDR"
  created_at: string
  public_access_token_hash: string
}

interface PublicOrderAccessRow {
  order_number: string
  public_access_token_hash: string
}

interface PublicOrderItemRow {
  item_name: string
  quantity: number
  line_total: number
  sort_order: number
}

interface PublicOrderHistoryRow {
  status_to: OrderStatus
  created_at: string
}

function getCustomerDisplayName(name: string) {
  return name.trim().split(/\s+/)[0] || "Customer"
}

function mapPublicItem(row: PublicOrderItemRow): PublicOrderItem {
  return {
    itemName: row.item_name,
    quantity: row.quantity,
    lineTotal: row.line_total,
  }
}

export interface PublicOrderAccessGrant {
  orderNumber: string
  publicAccessTokenHash: string
}

export async function exchangePublicOrderAccessToken(
  orderNumber: string,
  token: string | null | undefined,
): Promise<PublicOrderAccessGrant | null> {
  const normalizedOrderNumber = orderNumber.trim().toUpperCase()
  const normalizedToken = String(token ?? "").trim()

  if (
    !orderNumberPattern.test(normalizedOrderNumber) ||
    !publicOrderTokenPattern.test(normalizedToken)
  ) {
    return null
  }

  const client = getSupabaseServiceRoleClient()

  if (!client) {
    return null
  }

  const { data, error } = await client
    .from("orders")
    .select("order_number,public_access_token_hash")
    .eq("order_number", normalizedOrderNumber)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const order = data as PublicOrderAccessRow

  if (!publicOrderTokenMatches(normalizedToken, order.public_access_token_hash)) {
    return null
  }

  return {
    orderNumber: order.order_number,
    publicAccessTokenHash: order.public_access_token_hash,
  }
}

export async function getPublicOrderDetail(
  orderNumber: string,
  accessCredential: string | null | undefined,
): Promise<PublicOrderDetail | null> {
  const normalizedOrderNumber = orderNumber.trim().toUpperCase()
  const credential = String(accessCredential ?? "")

  if (
    !orderNumberPattern.test(normalizedOrderNumber) ||
    !credential ||
    credential.length > publicOrderAccessMaximumCredentialLength
  ) {
    return null
  }

  const client = getSupabaseServiceRoleClient()

  if (!client) {
    return null
  }

  const { data: orderData, error: orderError } = await client
    .from("orders")
    .select(
      "id,order_number,status,customer_name,event_date,due_date,subtotal_amount,discount_amount,total_amount,currency,created_at,public_access_token_hash",
    )
    .eq("order_number", normalizedOrderNumber)
    .maybeSingle()

  if (orderError || !orderData) {
    return null
  }

  const order = orderData as PublicOrderRow

  if (
    !hasValidPublicOrderAccess(
      credential,
      order.order_number,
      order.public_access_token_hash,
    )
  ) {
    return null
  }

  const [itemsResult, historiesResult] = await Promise.all([
    client
      .from("order_items")
      .select("item_name,quantity,line_total,sort_order")
      .eq("order_id", order.id)
      .order("sort_order", { ascending: true }),
    client
      .from("order_status_histories")
      .select("status_to,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ])

  if (itemsResult.error || historiesResult.error) {
    return null
  }

  return {
    orderNumber: order.order_number,
    status: order.status,
    customerDisplayName: getCustomerDisplayName(order.customer_name),
    eventDate: order.event_date,
    dueDate: order.due_date,
    subtotalAmount: order.subtotal_amount,
    discountAmount: order.discount_amount,
    totalAmount: order.total_amount,
    currency: order.currency,
    createdAt: order.created_at,
    items: ((itemsResult.data ?? []) as PublicOrderItemRow[]).map(mapPublicItem),
    statusEvents: ((historiesResult.data ?? []) as PublicOrderHistoryRow[]).map((history) => ({
      status: history.status_to,
      createdAt: history.created_at,
    })),
  }
}
