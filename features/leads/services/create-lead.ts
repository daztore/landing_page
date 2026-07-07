import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  CreateLeadInput,
  CreateLeadResult,
  LeadProductSnapshot,
} from "@/features/leads/types"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"

type CreateLeadServiceResult =
  | { status: "ok"; lead: CreateLeadResult }
  | { status: "unconfigured" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }

interface ProductRow {
  id: string
  slug: string
  category_slug: string
  title: string
  start_price: number
  end_price: number | null
  image_url: string | null
  processing_time: string | null
  is_customizable: boolean
  is_available: boolean
}

interface CategoryRow {
  slug: string
  name: string
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

function getPriceLabel(start: number, end?: number) {
  const startLabel = currencyFormatter.format(start)
  return end ? `${startLabel} - ${currencyFormatter.format(end)}` : `Mulai dari ${startLabel}`
}

async function getProductSnapshot(
  client: SupabaseClient,
  productSlug?: string,
): Promise<
  | { status: "ok"; productId: string | null; snapshot: LeadProductSnapshot | Record<string, never> }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
> {
  if (!productSlug) {
    return { status: "ok", productId: null, snapshot: {} }
  }

  const { data: productData, error: productError } = await client
    .from("products")
    .select(
      "id,slug,category_slug,title,start_price,end_price,image_url,processing_time,is_customizable,is_available",
    )
    .eq("slug", productSlug)
    .eq("is_active", true)
    .neq("source", "feedback_request")
    .maybeSingle()

  if (productError) {
    console.error("[Supabase] Gagal memvalidasi produk lead:", productError.message)
    return { status: "error", message: "Inquiry belum bisa diproses. Silakan coba lagi." }
  }

  if (!productData) {
    return { status: "invalid", message: "Produk yang dipilih tidak ditemukan." }
  }

  const product = productData as ProductRow
  const { data: categoryData, error: categoryError } = await client
    .from("product_categories")
    .select("slug,name")
    .eq("slug", product.category_slug)
    .eq("is_active", true)
    .maybeSingle()

  if (categoryError) {
    console.error("[Supabase] Gagal memvalidasi kategori lead:", categoryError.message)
    return { status: "error", message: "Inquiry belum bisa diproses. Silakan coba lagi." }
  }

  if (!categoryData) {
    return { status: "invalid", message: "Kategori produk tidak aktif." }
  }

  const category = categoryData as CategoryRow
  const endPrice = product.end_price ?? undefined

  return {
    status: "ok",
    productId: product.id,
    snapshot: {
      slug: product.slug,
      title: product.title,
      category: {
        slug: category.slug,
        name: category.name,
      },
      price: {
        start: product.start_price,
        end: endPrice,
        label: getPriceLabel(product.start_price, endPrice),
        isEstimate: true,
      },
      imageUrl: product.image_url ?? undefined,
      processingTime: product.processing_time ?? undefined,
      customizable: product.is_customizable,
      available: product.is_available,
    },
  }
}

function getInitialMessage(input: CreateLeadInput) {
  return (
    input.message ||
    `Inquiry baru dari ${input.source === "product_detail" ? "detail produk" : "form publik"}.`
  )
}

export async function createPublicLead(input: CreateLeadInput): Promise<CreateLeadServiceResult> {
  const client = getSupabaseServiceRoleClient()

  if (!client) {
    return { status: "unconfigured" }
  }

  const productResult = await getProductSnapshot(client, input.productSlug)
  if (productResult.status !== "ok") {
    return productResult
  }

  const { data: leadData, error: leadError } = await client
    .from("leads")
    .insert({
      source: input.source,
      status: "new",
      customer_name: input.customerName,
      whatsapp_number: input.whatsappNumber,
      email: input.email ?? null,
      product_id: productResult.productId,
      product_slug: input.productSlug ?? null,
      product_snapshot: productResult.snapshot,
      interest_category: input.interestCategory ?? null,
      event_date: input.eventDate ?? null,
      budget_range: input.budgetRange ?? null,
      message: input.message ?? null,
      consent_accepted: input.consentAccepted,
      consent_text: input.consentText,
      metadata: input.metadata,
    })
    .select("id")
    .single()

  if (leadError || !leadData) {
    console.error("[Supabase] Gagal menyimpan lead:", leadError?.message)
    return { status: "error", message: "Inquiry belum bisa disimpan. Silakan coba lagi." }
  }

  const leadId = (leadData as { id: string }).id
  const { error: messageError } = await client.from("lead_messages").insert({
    lead_id: leadId,
    message_type: "customer_message",
    channel: "form",
    body: getInitialMessage(input),
    status_from: null,
    status_to: "new",
    created_by: null,
  })

  if (messageError) {
    console.error("[Supabase] Gagal menyimpan pesan lead:", messageError.message)
    await client.from("leads").delete().eq("id", leadId)
    return { status: "error", message: "Inquiry belum bisa disimpan. Silakan coba lagi." }
  }

  return {
    status: "ok",
    lead: {
      id: leadId,
    },
  }
}
