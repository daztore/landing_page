import type { StorageBucket } from "@/lib/supabase/storage"

export const feedbackProductCategories = [
  {
    value: "buket",
    label: "Buket",
    catalogSlug: "bouquet",
  },
  {
    value: "seserahan",
    label: "Seserahan",
    catalogSlug: "seserahan",
  },
  {
    value: "mahar",
    label: "Mahar",
    catalogSlug: "mahar",
  },
  {
    value: "parsel",
    label: "Parsel",
    catalogSlug: "hampers",
  },
] as const

export type FeedbackProductCategory =
  (typeof feedbackProductCategories)[number]["value"]

export const feedbackRecommendations = [
  "Produk sesuai harapan",
  "Desain rapi dan menarik",
  "Pengiriman aman",
  "Cocok untuk hadiah",
  "Pelayanan ramah",
  "Ingin pesan lagi",
] as const

export const feedbackProductPhotoBucket: StorageBucket = "catalogs"
export const feedbackCustomerPhotoBucket: StorageBucket =
  "feedback_customer_photos"

export const feedbackImageMaxBytes = 5 * 1024 * 1024
export const feedbackCustomerPhotoMaxFiles = 5

export function isFeedbackProductCategory(
  value: string,
): value is FeedbackProductCategory {
  return feedbackProductCategories.some((category) => category.value === value)
}

export function getFeedbackCategoryLabel(value: string) {
  return (
    feedbackProductCategories.find((category) => category.value === value)
      ?.label ?? value
  )
}

export function getCatalogSlugForFeedbackCategory(
  value: FeedbackProductCategory,
) {
  return feedbackProductCategories.find((category) => category.value === value)!
    .catalogSlug
}
