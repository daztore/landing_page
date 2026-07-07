import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { Category } from "@/lib/data/types"

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export interface CatalogOrderProductSnapshot {
  id: string
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

export interface CatalogOrderProductOption {
  slug: string
  title: string
  categoryName: string
  startPrice: number
  priceLabel: string
}

interface ProductRow {
  id: string
  slug: string
  category_slug: Category
  title: string
  start_price: number
  end_price: number | null
  image_url: string | null
  processing_time: string | null
  is_customizable: boolean
  is_available: boolean
}

interface CategoryRow {
  slug: Category
  name: string
}

function getPriceLabel(start: number, end?: number) {
  const startLabel = currencyFormatter.format(start)

  if (!end) {
    return `Mulai dari ${startLabel}`
  }

  return `${startLabel} - ${currencyFormatter.format(end)}`
}

export async function getCatalogProductForOrder(
  client: SupabaseClient,
  slug: string,
): Promise<CatalogOrderProductSnapshot | null> {
  if (!productSlugPattern.test(slug)) {
    return null
  }

  const { data: productData, error: productError } = await client
    .from("products")
    .select(
      "id,slug,category_slug,title,start_price,end_price,image_url,processing_time,is_customizable,is_available",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .neq("source", "feedback_request")
    .maybeSingle()

  if (productError) {
    throw new Error(productError.message)
  }

  if (!productData) {
    return null
  }

  const product = productData as ProductRow

  const { data: categoryData, error: categoryError } = await client
    .from("product_categories")
    .select("slug,name")
    .eq("slug", product.category_slug)
    .eq("is_active", true)
    .maybeSingle()

  if (categoryError) {
    throw new Error(categoryError.message)
  }

  if (!categoryData) {
    return null
  }

  const category = categoryData as CategoryRow

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: {
      slug: category.slug,
      name: category.name,
    },
    price: {
      start: product.start_price,
      end: product.end_price ?? undefined,
      label: getPriceLabel(product.start_price, product.end_price ?? undefined),
      isEstimate: true,
    },
    imageUrl: product.image_url ?? undefined,
    processingTime: product.processing_time ?? undefined,
    customizable: product.is_customizable,
    available: product.is_available,
  }
}

export async function listCatalogProductsForOrder(
  client: SupabaseClient,
): Promise<CatalogOrderProductOption[]> {
  const [productsResult, categoriesResult] = await Promise.all([
    client
      .from("products")
      .select("slug,category_slug,title,start_price,end_price,sort_order")
      .eq("is_active", true)
      .neq("source", "feedback_request")
      .order("sort_order", { ascending: true }),
    client.from("product_categories").select("slug,name").eq("is_active", true),
  ])

  if (productsResult.error) {
    throw new Error(productsResult.error.message)
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message)
  }

  const categories = new Map(
    ((categoriesResult.data ?? []) as CategoryRow[]).map((category) => [
      category.slug,
      category.name,
    ]),
  )

  return ((productsResult.data ?? []) as Array<Pick<
    ProductRow,
    "slug" | "category_slug" | "title" | "start_price" | "end_price"
  >>)
    .filter((product) => categories.has(product.category_slug))
    .map((product) => ({
      slug: product.slug,
      title: product.title,
      categoryName: categories.get(product.category_slug) ?? product.category_slug,
      startPrice: product.start_price,
      priceLabel: getPriceLabel(product.start_price, product.end_price ?? undefined),
    }))
}
