import {
  getFeedbackCategoryLabel,
  type FeedbackProductCategory,
} from "@/lib/feedback/constants"
import { getSupabaseClient } from "@/lib/supabase/client"

export type PublicFeedbackStatus = "pending" | "submitted" | "expired"

export interface PublicFeedbackRequest {
  id: string
  customerName: string
  productName: string
  productCategory: FeedbackProductCategory
  productCategoryLabel: string
  productDescription: string
  productPhotoUrl: string
  status: PublicFeedbackStatus
  submittedAt: string | null
}

interface FeedbackRequestRow {
  id: string
  customer_name: string
  product_name: string
  product_category: FeedbackProductCategory
  product_description: string | null
  product_photo_url: string
  status: PublicFeedbackStatus
  submitted_at: string | null
}

export const feedbackUuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type PublicFeedbackRequestResult =
  | { status: "ok"; request: PublicFeedbackRequest }
  | { status: "not-found" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }

export async function getPublicFeedbackRequest(
  id: string,
): Promise<PublicFeedbackRequestResult> {
  if (!feedbackUuidPattern.test(id)) {
    return { status: "not-found" }
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return { status: "unconfigured" }
  }

  const { data, error } = await supabase
    .from("feedback_requests")
    .select(
      "id,customer_name,product_name,product_category,product_description,product_photo_url,status,submitted_at",
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    return { status: "error", message: error.message }
  }

  if (!data) {
    return { status: "not-found" }
  }

  const row = data as FeedbackRequestRow

  return {
    status: "ok",
    request: {
      id: row.id,
      customerName: row.customer_name,
      productName: row.product_name,
      productCategory: row.product_category,
      productCategoryLabel: getFeedbackCategoryLabel(row.product_category),
      productDescription: row.product_description ?? "",
      productPhotoUrl: row.product_photo_url,
      status: row.status,
      submittedAt: row.submitted_at,
    },
  }
}
