import {
  fallbackCarouselTestimonials,
  fallbackCatalog,
  fallbackContact,
  fallbackFaq,
  fallbackFeatures,
  fallbackFinalCta,
  fallbackGallery,
  fallbackHero,
  fallbackLandingPage,
  fallbackNavigation,
  fallbackPackages,
  fallbackProcess,
  fallbackStory,
  fallbackTestimonials,
  fallbackUrgency,
} from "@/lib/data/fallback"
import type {
  CatalogData,
  Category,
  FaqItem,
  FeatureItem,
  GalleryItem,
  LandingPageData,
  MetricItem,
  NavigationItem,
  NavigationPlacement,
  PackageTier,
  PackagesSection,
  ProcessItem,
  Product,
  ProductCategory,
  SectionHeading,
  SiteChromeData,
  SiteContact,
  TestimonialItem,
  TestimonialVariant,
} from "@/lib/data/types"
import { getSupabaseClient } from "@/lib/supabase/client"
import {
  resolveStorageImageUrl,
  type StorageBucket,
} from "@/lib/supabase/storage"

type JsonObject = Record<string, unknown>

interface SectionRow {
  slug: string
  eyebrow: string | null
  title: string
  highlighted_title: string | null
  description: string | null
  image_url: string | null
  image_alt: string | null
  content: JsonObject | null
}

interface LandingItemRow {
  section_slug: string
  slug: string
  title: string | null
  description: string | null
  icon: string | null
  label: string | null
  value: string | null
  sort_order: number
}

interface NavigationRow {
  slug: string
  label: string
  href: string
  placement: NavigationPlacement
  badge: string | null
  icon: string | null
  is_disabled: boolean
  sort_order: number
}

interface GalleryRow {
  slug: string
  label: string
  image_url: string
  image_alt: string
  grid_span: string
  sort_order: number
}

interface TestimonialRow {
  slug: string
  display_variant: TestimonialVariant
  name: string
  subtitle: string
  content: string
  rating: number
  avatar: string | null
  sort_order: number
}

interface FaqRow {
  slug: string
  question: string
  answer: string
  sort_order: number
}

interface CategoryRow {
  slug: Category
  name: string
  emoji: string
  sort_order: number
}

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
  sort_order: number
}

interface PackageTierRow {
  slug: string
  name: string
  tagline: string
  price_label: string
  icon: string
  description: string
  features: string[]
  is_highlighted: boolean
  sort_order: number
}

function reportQueryError(scope: string, error: { message: string } | null) {
  if (error) {
    console.error(`[Supabase] Gagal memuat ${scope}: ${error.message}. Fallback lokal digunakan.`)
  }
}

function resolveSection<T extends SectionHeading>(
  slug: string,
  fallback: T,
  rows: SectionRow[],
  imageBucket?: StorageBucket,
): T {
  const row = rows.find((section) => section.slug === slug)

  if (!row) {
    return { ...fallback }
  }

  const resolved = {
    ...fallback,
    ...(row.content ?? {}),
    slug: row.slug,
    eyebrow: row.eyebrow ?? fallback.eyebrow,
    title: row.title,
    highlightedTitle: row.highlighted_title ?? fallback.highlightedTitle,
    description: row.description ?? fallback.description,
    ...("imageUrl" in fallback && row.image_url ? { imageUrl: row.image_url } : {}),
    ...("imageAlt" in fallback && row.image_alt ? { imageAlt: row.image_alt } : {}),
  } as T

  if (imageBucket && "imageUrl" in fallback) {
    const imageFallback = (fallback as T & { imageUrl: string }).imageUrl
    return {
      ...resolved,
      imageUrl: resolveStorageImageUrl(imageBucket, row.image_url, imageFallback),
    }
  }

  return resolved
}

function rowsForSection(rows: LandingItemRow[], sectionSlug: string) {
  return rows.filter((item) => item.section_slug === sectionSlug)
}

function resolveMetrics(
  rows: LandingItemRow[],
  sectionSlug: string,
  fallback: MetricItem[],
): MetricItem[] {
  const items = rowsForSection(rows, sectionSlug)

  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => ({
    slug: item.slug,
    label: item.label ?? item.title ?? item.slug,
    value: item.value ?? "",
  }))
}

function resolveFeatures(
  rows: LandingItemRow[],
  sectionSlug: string,
  fallback: FeatureItem[],
): FeatureItem[] {
  const items = rowsForSection(rows, sectionSlug)

  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => ({
    slug: item.slug,
    title: item.title ?? item.slug,
    description: item.description ?? "",
    icon: item.icon ?? "heart",
  }))
}

function resolveProcessItems(
  rows: LandingItemRow[],
  fallback: ProcessItem[],
): ProcessItem[] {
  const items = rowsForSection(rows, "process")

  if (items.length === 0) {
    return fallback
  }

  return items.map((item) => ({
    slug: item.slug,
    number: item.value ?? "",
    title: item.title ?? item.slug,
    description: item.description ?? "",
  }))
}

function resolveTrustPoints(rows: LandingItemRow[], fallback: string[]) {
  const items = rowsForSection(rows, "final-cta")
  return items.length > 0 ? items.map((item) => item.label ?? item.title ?? item.slug) : fallback
}

function resolveContact(value: unknown): SiteContact {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallbackContact
  }

  return {
    ...fallbackContact,
    ...(value as Partial<SiteContact>),
  }
}

async function querySiteContact(): Promise<SiteContact> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackContact
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "contact")
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle()

  reportQueryError("site settings", error)
  return error || !data ? fallbackContact : resolveContact(data.value)
}

async function queryNavigation(): Promise<NavigationItem[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackNavigation
  }

  const { data, error } = await supabase
    .from("navigation_items")
    .select("slug,label,href,placement,badge,icon,is_disabled,sort_order")
    .eq("is_active", true)
    .order("sort_order")

  reportQueryError("navigation items", error)

  if (error || !data || data.length === 0) {
    return fallbackNavigation
  }

  return (data as NavigationRow[]).map((item) => ({
    slug: item.slug,
    label: item.label,
    href: item.href,
    placement: item.placement,
    badge: item.badge ?? undefined,
    icon: item.icon ?? undefined,
    disabled: item.is_disabled,
    sortOrder: item.sort_order,
  }))
}

async function querySections(slugs: string[]): Promise<SectionRow[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("landing_sections")
    .select("slug,eyebrow,title,highlighted_title,description,image_url,image_alt,content")
    .in("slug", slugs)
    .eq("is_active", true)

  reportQueryError("landing sections", error)
  return error || !data ? [] : (data as SectionRow[])
}

async function queryLandingItems(sectionSlugs: string[]): Promise<LandingItemRow[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("landing_items")
    .select("section_slug,slug,title,description,icon,label,value,sort_order")
    .in("section_slug", sectionSlugs)
    .eq("is_active", true)
    .order("sort_order")

  reportQueryError("landing items", error)
  return error || !data ? [] : (data as LandingItemRow[])
}

async function queryGallery(): Promise<GalleryItem[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackGallery.items
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .select("slug,label,image_url,image_alt,grid_span,sort_order")
    .eq("is_active", true)
    .order("sort_order")

  reportQueryError("gallery items", error)

  if (error || !data || data.length === 0) {
    return fallbackGallery.items
  }

  return (data as GalleryRow[]).map((item) => ({
    slug: item.slug,
    label: item.label,
    imageUrl: resolveStorageImageUrl(
      "landing_page",
      item.image_url,
      fallbackGallery.items.find((fallbackItem) => fallbackItem.slug === item.slug)?.imageUrl,
    ),
    imageAlt: item.image_alt,
    span: item.grid_span,
    sortOrder: item.sort_order,
  }))
}

export async function getTestimonials(
  variant: TestimonialVariant = "grid",
): Promise<TestimonialItem[]> {
  const fallback = variant === "grid" ? fallbackTestimonials.items : fallbackCarouselTestimonials
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallback
  }

  const { data, error } = await supabase
    .from("testimonials")
    .select("slug,display_variant,name,subtitle,content,rating,avatar,sort_order")
    .eq("display_variant", variant)
    .eq("is_active", true)
    .order("sort_order")

  reportQueryError(`${variant} testimonials`, error)

  if (error || !data || data.length === 0) {
    return fallback
  }

  return (data as TestimonialRow[]).map((item) => ({
    slug: item.slug,
    variant: item.display_variant,
    name: item.name,
    subtitle: item.subtitle,
    content: item.content,
    rating: item.rating,
    avatar: item.avatar ?? undefined,
    sortOrder: item.sort_order,
  }))
}

async function queryFaqs(): Promise<FaqItem[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackFaq.items
  }

  const { data, error } = await supabase
    .from("faqs")
    .select("slug,question,answer,sort_order")
    .eq("is_active", true)
    .order("sort_order")

  reportQueryError("FAQs", error)

  if (error || !data || data.length === 0) {
    return fallbackFaq.items
  }

  return (data as FaqRow[]).map((item) => ({
    slug: item.slug,
    question: item.question,
    answer: item.answer,
    sortOrder: item.sort_order,
  }))
}

export async function getLandingPageData(): Promise<LandingPageData> {
  const sectionSlugs = [
    "hero",
    "story",
    "process",
    "features",
    "gallery",
    "testimonials",
    "faq",
    "urgency",
    "final-cta",
  ]

  const [contact, navigation, sections, items, galleryItems, testimonialItems, faqItems] =
    await Promise.all([
      querySiteContact(),
      queryNavigation(),
      querySections(sectionSlugs),
      queryLandingItems(["hero", "story", "process", "features", "urgency", "final-cta"]),
      queryGallery(),
      getTestimonials("grid"),
      queryFaqs(),
    ])

  const hero = resolveSection("hero", fallbackHero, sections, "landing_page")
  hero.mobileBackgroundUrl = resolveStorageImageUrl(
    "landing_page",
    hero.mobileBackgroundUrl,
    fallbackHero.mobileBackgroundUrl,
  )
  hero.metrics = resolveMetrics(items, "hero", fallbackHero.metrics)

  const story = resolveSection("story", fallbackStory, sections, "landing_page")
  story.values = resolveFeatures(items, "story", fallbackStory.values)

  const process = resolveSection("process", fallbackProcess, sections)
  process.items = resolveProcessItems(items, fallbackProcess.items)

  const features = resolveSection("features", fallbackFeatures, sections)
  features.items = resolveFeatures(items, "features", fallbackFeatures.items)

  const gallery = resolveSection("gallery", fallbackGallery, sections)
  gallery.items = galleryItems

  const testimonials = resolveSection("testimonials", fallbackTestimonials, sections)
  testimonials.items = testimonialItems

  const faq = resolveSection("faq", fallbackFaq, sections)
  faq.items = faqItems

  const urgency = resolveSection("urgency", fallbackUrgency, sections)
  urgency.metrics = resolveMetrics(items, "urgency", fallbackUrgency.metrics)

  const finalCta = resolveSection("final-cta", fallbackFinalCta, sections)
  finalCta.trustPoints = resolveTrustPoints(items, fallbackFinalCta.trustPoints)

  return {
    contact,
    navigation,
    hero,
    story,
    process,
    features,
    gallery,
    testimonials,
    faq,
    urgency,
    finalCta,
  }
}

export async function getSiteChromeData(): Promise<SiteChromeData> {
  const [contact, navigation] = await Promise.all([querySiteContact(), queryNavigation()])
  return { contact, navigation }
}

export async function getCatalogData(): Promise<CatalogData> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackCatalog
  }

  const [contact, sectionsResult, categoriesResult, productsResult] = await Promise.all([
    querySiteContact(),
    querySections(["catalog"]),
    supabase
      .from("product_categories")
      .select("slug,name,emoji,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select(
        "slug,category_slug,title,description,start_price,end_price,image_url,badge,processing_time,is_customizable,is_available,sort_order",
      )
      .eq("is_active", true)
      .order("sort_order"),
  ])

  reportQueryError("product categories", categoriesResult.error)
  reportQueryError("products", productsResult.error)

  const categories =
    categoriesResult.error || !categoriesResult.data || categoriesResult.data.length === 0
      ? fallbackCatalog.categories
      : (categoriesResult.data as CategoryRow[]).map(
          (category): ProductCategory => ({
            id: category.slug,
            name: category.name,
            emoji: category.emoji,
            sortOrder: category.sort_order,
          }),
        )

  const activeCategories = new Set(categories.map((category) => category.id))
  const fallbackProductsById = new Map(
    fallbackCatalog.products.map((product) => [product.id, product]),
  )
  const products =
    productsResult.error || !productsResult.data || productsResult.data.length === 0
      ? fallbackCatalog.products
      : (productsResult.data as ProductRow[])
          .filter((product) => activeCategories.has(product.category_slug))
          .map(
            (product): Product => ({
              id: product.slug,
              category: product.category_slug,
              title: product.title,
              description: product.description,
              startPrice: product.start_price,
              endPrice: product.end_price ?? undefined,
              image: resolveStorageImageUrl(
                "catalogs",
                product.image_url,
                fallbackProductsById.get(product.slug)?.image,
              ),
              badge: product.badge ?? undefined,
              processingTime: product.processing_time,
              customizable: product.is_customizable,
              availability: product.is_available,
            }),
          )

  const section = resolveSection("catalog", fallbackCatalog.section, sectionsResult)

  return {
    contact,
    section,
    categories,
    products: products.length > 0 ? products : fallbackCatalog.products,
  }
}

export async function getPackagesData(): Promise<PackagesSection> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return fallbackPackages
  }

  const [sections, tiersResult] = await Promise.all([
    querySections(["packages"]),
    supabase
      .from("package_tiers")
      .select("slug,name,tagline,price_label,icon,description,features,is_highlighted,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
  ])

  reportQueryError("package tiers", tiersResult.error)

  const items =
    tiersResult.error || !tiersResult.data || tiersResult.data.length === 0
      ? fallbackPackages.items
      : (tiersResult.data as PackageTierRow[]).map(
          (tier): PackageTier => ({
            slug: tier.slug,
            name: tier.name,
            tagline: tier.tagline,
            priceLabel: tier.price_label,
            icon: tier.icon,
            description: tier.description,
            features: tier.features,
            highlighted: tier.is_highlighted,
            sortOrder: tier.sort_order,
          }),
        )

  const section = resolveSection("packages", fallbackPackages, sections)
  section.items = items
  return section
}

export function getFallbackLandingPageData() {
  return fallbackLandingPage
}
