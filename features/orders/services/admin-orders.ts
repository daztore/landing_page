import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { getCatalogProductForOrder } from "@/features/catalog/server"
import { getAdminLeadDetail } from "@/features/leads/server"
import {
  orderStatuses,
  type CreateOrderInput,
  type CreateOrderResult,
  type OrderProductSnapshot,
  type OrderStatus,
} from "@/features/orders/types"
import { uuidPattern } from "@/features/orders/validation/order-request"
import {
  buildPublicOrderUrl,
  createPublicOrderToken,
  getPublicOrderTokenHint,
  hashPublicOrderToken,
} from "@/features/orders/services/public-token"

interface InsertedOrderRow {
  id: string
  order_number: string
}

interface PreparedOrderItem {
  product_id: string | null
  product_slug: string | null
  product_snapshot: OrderProductSnapshot | Record<string, never>
  item_type: "manual" | "catalog"
  item_name: string
  item_description: string | null
  quantity: number
  unit_price: number
  line_total: number
  custom_options: Record<string, string>
  admin_note: string | null
  sort_order: number
}

function getText(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength)
}

function isOrderStatus(value: string): value is OrderStatus {
  return (orderStatuses as readonly string[]).includes(value)
}

function toProductSnapshot(
  product: Awaited<ReturnType<typeof getCatalogProductForOrder>>,
): OrderProductSnapshot | Record<string, never> {
  if (!product) {
    return {}
  }

  return {
    slug: product.slug,
    title: product.title,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
    processingTime: product.processingTime,
    customizable: product.customizable,
    available: product.available,
  }
}

async function prepareOrderItems(
  client: SupabaseClient,
  input: CreateOrderInput,
): Promise<PreparedOrderItem[]> {
  const prepared: PreparedOrderItem[] = []

  for (const [index, item] of input.items.entries()) {
    const product = item.productSlug
      ? await getCatalogProductForOrder(client, item.productSlug)
      : null

    if (item.productSlug && !product) {
      throw new Error(`Produk katalog item #${index + 1} tidak ditemukan atau tidak aktif.`)
    }

    prepared.push({
      product_id: product?.id ?? null,
      product_slug: product?.slug ?? null,
      product_snapshot: toProductSnapshot(product),
      item_type: product ? "catalog" : "manual",
      item_name: item.itemName,
      item_description: item.itemDescription ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.quantity * item.unitPrice,
      custom_options: item.customOptions ?? {},
      admin_note: item.adminNote ?? null,
      sort_order: index,
    })
  }

  return prepared
}

async function cleanupOrder(client: SupabaseClient, orderId: string) {
  await client.from("orders").delete().eq("id", orderId)
}

export async function createAdminOrder(
  client: SupabaseClient,
  adminId: string,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (input.leadId) {
    const lead = await getAdminLeadDetail(client, input.leadId)

    if (!lead) {
      throw new Error("Lead tidak ditemukan.")
    }
  }

  const items = await prepareOrderItems(client, input)
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  const total = subtotal - input.discountAmount

  if (total < 0) {
    throw new Error("Total order tidak valid.")
  }

  const publicToken = createPublicOrderToken()
  const publicTokenHash = hashPublicOrderToken(publicToken)
  const publicTokenHint = getPublicOrderTokenHint(publicToken)

  const { data, error } = await client
    .from("orders")
    .insert({
      lead_id: input.leadId ?? null,
      status: "draft",
      customer_name: input.customerName,
      whatsapp_number: input.whatsappNumber,
      email: input.email ?? null,
      event_date: input.eventDate ?? null,
      due_date: input.dueDate ?? null,
      subtotal_amount: subtotal,
      discount_amount: input.discountAmount,
      total_amount: total,
      currency: "IDR",
      public_access_token_hash: publicTokenHash,
      public_access_token_hint: publicTokenHint,
      admin_note: input.adminNote ?? null,
      metadata: {
        source: input.leadId ? "lead_conversion" : "admin_manual",
      },
      created_by: adminId,
      updated_by: adminId,
    })
    .select("id,order_number")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Order belum bisa dibuat.")
  }

  const order = data as InsertedOrderRow

  try {
    const { error: itemsError } = await client.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        ...item,
      })),
    )

    if (itemsError) {
      throw new Error(itemsError.message)
    }

    const { error: historyError } = await client.from("order_status_histories").insert({
      order_id: order.id,
      status_from: null,
      status_to: "draft",
      note: "Order draft dibuat.",
      created_by: adminId,
    })

    if (historyError) {
      throw new Error(historyError.message)
    }

    if (input.leadId) {
      const { error: leadStatusError } = await client.rpc("change_lead_status", {
        p_lead_id: input.leadId,
        p_status: "converted",
        p_note: `Order ${order.order_number} dibuat dari lead.`,
      })

      if (leadStatusError) {
        throw new Error(leadStatusError.message)
      }
    }
  } catch (error) {
    await cleanupOrder(client, order.id)
    throw error
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    publicToken,
    publicUrl: buildPublicOrderUrl(order.order_number, publicToken),
  }
}

export async function updateAdminOrderStatus(
  client: SupabaseClient,
  orderId: string,
  status: string,
  note?: string,
) {
  if (!uuidPattern.test(orderId)) {
    throw new Error("Order tidak valid.")
  }

  if (!isOrderStatus(status)) {
    throw new Error("Status order tidak valid.")
  }

  const { error } = await client.rpc("change_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_note: note?.trim() || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function regenerateAdminOrderPublicLink(
  client: SupabaseClient,
  adminId: string,
  orderId: string,
) {
  if (!uuidPattern.test(orderId)) {
    throw new Error("Order tidak valid.")
  }

  const publicToken = createPublicOrderToken()
  const { data, error } = await client
    .from("orders")
    .update({
      public_access_token_hash: hashPublicOrderToken(publicToken),
      public_access_token_hint: getPublicOrderTokenHint(publicToken),
      updated_by: adminId,
    })
    .eq("id", orderId)
    .select("order_number")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Link publik order belum bisa dibuat ulang.")
  }

  const orderNumber = String(data.order_number)

  return {
    publicToken,
    publicUrl: buildPublicOrderUrl(orderNumber, publicToken),
  }
}

export async function handleAdminOrderAction(
  client: SupabaseClient,
  adminId: string,
  orderId: string,
  formData: FormData,
) {
  const action = getText(formData, "action", 40)

  if (action === "update_status") {
    await updateAdminOrderStatus(
      client,
      orderId,
      getText(formData, "status", 40),
      getText(formData, "note", 4000),
    )
    return {}
  }

  if (action === "regenerate_public_link") {
    return regenerateAdminOrderPublicLink(client, adminId, orderId)
  }

  throw new Error("Aksi order tidak valid.")
}
