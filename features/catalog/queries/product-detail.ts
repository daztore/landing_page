import { cache } from "react"

import { fallbackCatalog } from "@/lib/data/fallback"
import type { Category, Product } from "@/lib/data/types"
import { getSupabaseClient } from "@/lib/supabase/client"
import { resolveStorageImageUrl } from "@/lib/supabase/storage"
import type { ProductDetail, ProductSitemapEntry } from "@/features/catalog/types"

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

interface ProductRow {
  slug: string
  category_slug: Category
  title: string
  description: string
  start_price: number
  end_price: number | null
  image_url: string
  badge: Product["badge"] | null
  processing_time: string
  is_customizable: boolean
  is_available: boolean
  updated_at: string
  source: string
}

interface CategoryRow {
  slug: Category
  name: string
}

function reportQueryError(scope: string, error: { message: string } | null) {
  if (error) {
    console.error(`[Supabase] Gagal memuat ${scope}: ${error.message}. Fallback lokal digunakan.`)
  }
}

function isValidProductSlug(slug: string) {
  return productSlugPattern.test(slug)
}

function getFallbackCategoryName(category: Category) {
  return fallbackCatalog.categories.find((item) => item.id === category)?.name ?? category
}

function getPriceLabel(start: number, end?: number) {
  const startLabel = currencyFormatter.format(start)

  if (!end) {
    return `Mulai dari ${startLabel}`
  }

  return `${startLabel} - ${currencyFormatter.format(end)}`
}

function getInquiryMessage(productTitle: string) {
  return `Halo daztore.id, saya tertarik dengan ${productTitle}. Boleh dibantu konsultasi estimasi dan kustomisasinya?`
}

function mapProductToDetail(
  product: Product,
  categoryName = getFallbackCategoryName(product.category),
): ProductDetail {
  const endPrice = product.endPrice

  return {
    slug: product.id,
    title: product.title,
    category: {
      slug: product.category,
      name: categoryName,
    },
    description: product.description,
    price: {
      start: product.startPrice,
      end: endPrice,
      label: getPriceLabel(product.startPrice, endPrice),
      isEstimate: true,
    },
    image: {
      src: product.image,
      alt: product.title,
    },
    badge: product.badge,
    processingTime: product.processingTime,
    customizable: product.customizable,
    available: product.availability,
    inquiry: {
      defaultMessage: getInquiryMessage(product.title),
    },
  }
}

function getFallbackProductDetailBySlug(slug: string) {
  const product = fallbackCatalog.products.find((item) => item.id === slug)
  return product ? mapProductToDetail(product) : null
}

function mapRowToDetail(product: ProductRow, categoryName: string): ProductDetail {
  const resolvedImage = resolveStorageImageUrl(
    "catalogs",
    product.image_url,
    fallbackCatalog.products.find((item) => item.id === product.slug)?.image,
  )

  return mapProductToDetail(
    {
      id: product.slug,
      category: product.category_slug,
      title: product.title,
      description: product.description,
      startPrice: product.start_price,
      endPrice: product.end_price ?? undefined,
      image: resolvedImage,
      badge: product.badge ?? undefined,
      processingTime: product.processing_time,
      customizable: product.is_customizable,
      availability: product.is_available,
    },
    categoryName,
  )
}

export const getProductDetailBySlug = cache(async function getProductDetailBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  if (!isValidProductSlug(slug)) {
    return null
  }

  const supabase = getSupabaseClient()

  if (!supabase) {
    return getFallbackProductDetailBySlug(slug)
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "slug,category_slug,title,description,start_price,end_price,image_url,badge,processing_time,is_customizable,is_available,updated_at,source",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .neq("source", "feedback_request")
    .maybeSingle()

  if (productError) {
    reportQueryError("product detail", productError)
    return getFallbackProductDetailBySlug(slug)
  }

  if (!productData) {
    return null
  }

  const product = productData as ProductRow
  const { data: categoryData, error: categoryError } = await supabase
    .from("product_categories")
    .select("slug,name")
    .eq("slug", product.category_slug)
    .eq("is_active", true)
    .maybeSingle()

  reportQueryError("product detail category", categoryError)

  if (categoryError) {
    return getFallbackProductDetailBySlug(slug)
  }

  if (!categoryData) {
    return null
  }

  return mapRowToDetail(product, (categoryData as CategoryRow).name)
})

export const getProductSitemapEntries = cache(async function getProductSitemapEntries(): Promise<
  ProductSitemapEntry[]
> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackCatalog.products.map((product) => ({ slug: product.id }))
  }

  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("product_categories").select("slug").eq("is_active", true),
    supabase
      .from("products")
      .select("slug,category_slug,updated_at,source")
      .eq("is_active", true)
      .neq("source", "feedback_request")
      .order("sort_order"),
  ])

  reportQueryError("product sitemap categories", categoriesResult.error)
  reportQueryError("product sitemap entries", productsResult.error)

  if (categoriesResult.error || productsResult.error || !productsResult.data) {
    return fallbackCatalog.products.map((product) => ({ slug: product.id }))
  }

  const activeCategories = new Set(
    ((categoriesResult.data ?? []) as Pick<CategoryRow, "slug">[]).map((category) => category.slug),
  )

  const entries = (productsResult.data as Pick<ProductRow, "slug" | "category_slug" | "updated_at">[])
    .filter((product) => activeCategories.has(product.category_slug))
    .map((product) => ({
      slug: product.slug,
      updatedAt: product.updated_at ? new Date(product.updated_at) : undefined,
    }))

  return entries.length > 0
    ? entries
    : fallbackCatalog.products.map((product) => ({ slug: product.id }))
})
