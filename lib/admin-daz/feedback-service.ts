import type { SupabaseClient } from "@supabase/supabase-js"

import {
  feedbackCustomerPhotoBucket,
  feedbackProductPhotoBucket,
  getCatalogSlugForFeedbackCategory,
  getFeedbackCategoryLabel,
  isFeedbackProductCategory,
  type FeedbackProductCategory,
} from "@/lib/feedback/constants"
import { uploadFeedbackImage } from "@/lib/feedback/storage"
import { normalizeSlug } from "@/lib/admin-daz/validation"

type FeedbackStatus = "pending" | "submitted" | "expired"

interface FeedbackRequestRow {
  id: string
  customer_name: string
  product_name: string
  product_category: string
  product_description: string | null
  product_photo_url: string
  catalog_id: string | null
  status: FeedbackStatus
  created_at: string
  submitted_at: string | null
}

interface FeedbackSubmissionRow {
  id: string
  feedback_request_id: string
  rating: number
  criticism: string | null
  testimonial: string | null
  recommendations: string[] | null
  customer_photo_urls: string[] | null
  created_at: string
}

export interface AdminFeedbackSubmission {
  id: string
  rating: number
  criticism: string
  testimonial: string
  recommendations: string[]
  customerPhotoUrls: string[]
  createdAt: string
}

export interface AdminFeedbackRequest {
  id: string
  customerName: string
  productName: string
  productCategory: string
  productCategoryLabel: string
  productDescription: string
  productPhotoUrl: string
  catalogId: string | null
  status: FeedbackStatus
  createdAt: string
  submittedAt: string | null
  submission: AdminFeedbackSubmission | null
}

function getRequiredText(formData: FormData, name: string, label: string) {
  const value = String(formData.get(name) ?? "").trim()
  if (!value) {
    throw new Error(`${label} wajib diisi.`)
  }
  return value
}

function getOptionalText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

function getRequiredFile(formData: FormData, name: string, label: string) {
  const value = formData.get(name)

  if (
    !value ||
    typeof value === "string" ||
    typeof value.arrayBuffer !== "function" ||
    typeof value.size !== "number"
  ) {
    throw new Error(`${label} wajib diunggah.`)
  }

  return value as File
}

function createShortId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().slice(0, 8)
  }

  return Math.random().toString(36).slice(2, 10)
}

function createProductSlug(productName: string) {
  const base = normalizeSlug(productName).slice(0, 48) || "produk-feedback"
  return `feedback-${base}-${createShortId()}`
}

async function getNextProductSortOrder(client: SupabaseClient) {
  const { data } = await client
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastSortOrder = Number(
    (data as { sort_order?: number } | null)?.sort_order ?? 0,
  )

  return Number.isFinite(lastSortOrder) ? lastSortOrder + 10 : 10
}

function mapRequest(
  row: FeedbackRequestRow,
  submission: FeedbackSubmissionRow | undefined,
): AdminFeedbackRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    productName: row.product_name,
    productCategory: row.product_category,
    productCategoryLabel: getFeedbackCategoryLabel(row.product_category),
    productDescription: row.product_description ?? "",
    productPhotoUrl: row.product_photo_url,
    catalogId: row.catalog_id,
    status: row.status,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
    submission: submission
      ? {
          id: submission.id,
          rating: submission.rating,
          criticism: submission.criticism ?? "",
          testimonial: submission.testimonial ?? "",
          recommendations: submission.recommendations ?? [],
          customerPhotoUrls: submission.customer_photo_urls ?? [],
          createdAt: submission.created_at,
        }
      : null,
  }
}

export async function listFeedbackRequests(
  client: SupabaseClient,
  limit = 30,
): Promise<AdminFeedbackRequest[]> {
  const { data: requestRows, error: requestError } = await client
    .from("feedback_requests")
    .select(
      "id,customer_name,product_name,product_category,product_description,product_photo_url,catalog_id,status,created_at,submitted_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (requestError) {
    throw new Error(requestError.message)
  }

  const requests = (requestRows ?? []) as FeedbackRequestRow[]
  if (requests.length === 0) {
    return []
  }

  const requestIds = requests.map((request) => request.id)
  const { data: submissionRows, error: submissionError } = await client
    .from("feedback_submissions")
    .select(
      "id,feedback_request_id,rating,criticism,testimonial,recommendations,customer_photo_urls,created_at",
    )
    .in("feedback_request_id", requestIds)

  if (submissionError) {
    throw new Error(submissionError.message)
  }

  const submissionsByRequestId = new Map(
    ((submissionRows ?? []) as FeedbackSubmissionRow[]).map((submission) => [
      submission.feedback_request_id,
      submission,
    ]),
  )

  return requests.map((request) =>
    mapRequest(request, submissionsByRequestId.get(request.id)),
  )
}

export async function createFeedbackRequest(
  client: SupabaseClient,
  adminId: string,
  formData: FormData,
) {
  const customerName = getRequiredText(formData, "customerName", "Nama pelanggan")
  const productName = getRequiredText(formData, "productName", "Nama produk")
  const productCategoryValue = getRequiredText(
    formData,
    "productCategory",
    "Kategori produk",
  )
  const productDescription = getOptionalText(formData, "productDescription")
  const productPhoto = getRequiredFile(formData, "productPhoto", "Foto produk")

  if (!isFeedbackProductCategory(productCategoryValue)) {
    throw new Error("Kategori produk tidak valid.")
  }

  const productCategory: FeedbackProductCategory = productCategoryValue
  const catalogCategorySlug = getCatalogSlugForFeedbackCategory(productCategory)
  const uploadedProductPhotoPath = await uploadFeedbackImage(
    client,
    feedbackProductPhotoBucket,
    `feedback-products/${catalogCategorySlug}`,
    productPhoto,
  )

  let productId: string | null = null

  try {
    const sortOrder = await getNextProductSortOrder(client)
    const productPayload = {
      slug: createProductSlug(productName),
      category_slug: catalogCategorySlug,
      title: productName,
      description:
        productDescription ||
        `Produk dari request feedback pelanggan ${customerName}.`,
      start_price: 0,
      end_price: null,
      image_url: uploadedProductPhotoPath,
      badge: null,
      processing_time: "By request",
      is_customizable: true,
      is_available: false,
      sort_order: sortOrder,
      is_active: false,
      source: "feedback_request",
    }

    const { data: product, error: productError } = await client
      .from("products")
      .insert(productPayload)
      .select("id")
      .single()

    if (productError || !product) {
      throw new Error(productError?.message ?? "Gagal membuat produk katalog.")
    }

    productId = (product as { id: string }).id

    const { data: feedbackRequest, error: requestError } = await client
      .from("feedback_requests")
      .insert({
        customer_name: customerName,
        product_name: productName,
        product_category: productCategory,
        product_description: productDescription || null,
        product_photo_url: uploadedProductPhotoPath,
        catalog_id: productId,
        created_by: adminId,
        status: "pending",
      })
      .select(
        "id,customer_name,product_name,product_category,product_description,product_photo_url,catalog_id,status,created_at,submitted_at",
      )
      .single()

    if (requestError || !feedbackRequest) {
      throw new Error(requestError?.message ?? "Gagal membuat request feedback.")
    }

    await client
      .from("products")
      .update({ feedback_request_id: (feedbackRequest as FeedbackRequestRow).id })
      .eq("id", productId)

    return mapRequest(feedbackRequest as FeedbackRequestRow, undefined)
  } catch (error) {
    if (productId) {
      await client.from("products").delete().eq("id", productId)
    }

    await client.storage
      .from(feedbackProductPhotoBucket)
      .remove([uploadedProductPhotoPath])

    throw error
  }
}

export { feedbackCustomerPhotoBucket }
