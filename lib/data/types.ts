import type { Category, Product } from "@/lib/katalog-data"

export type { Category, Product }

export type NavigationPlacement = "header" | "header_cta" | "mobile" | "footer"

export interface NavigationItem {
  slug: string
  label: string
  href: string
  placement: NavigationPlacement
  badge?: string
  icon?: string
  disabled: boolean
  sortOrder: number
}

export interface SiteContact {
  brandName: string
  brandSuffix: string
  footerDescription: string
  whatsappNumber: string
  email: string
  instagramUrl: string
  instagramHandle: string
  location: string
  deliveryArea: string
  privacyUrl: string
  termsUrl: string
}

export interface SectionHeading {
  slug: string
  eyebrow?: string
  title: string
  highlightedTitle?: string
  description?: string
}

export interface MetricItem {
  slug: string
  label: string
  value: string
}

export interface HeroSection extends SectionHeading {
  badge: string
  primaryCtaLabel: string
  primaryCtaMessage: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  imageUrl: string
  imageAlt: string
  mobileBackgroundUrl: string
  collectionTitle: string
  collectionSubtitle: string
  accentLabel: string
  accentValue: string
  metrics: MetricItem[]
}

export interface FeatureItem {
  slug: string
  title: string
  description: string
  icon: string
}

export interface StorySection extends SectionHeading {
  secondaryDescription: string
  imageUrl: string
  imageAlt: string
  establishedLabel: string
  locationLabel: string
  values: FeatureItem[]
}

export interface ProcessItem {
  slug: string
  number: string
  title: string
  description: string
}

export interface ProcessSection extends SectionHeading {
  items: ProcessItem[]
}

export interface FeaturesSection extends SectionHeading {
  items: FeatureItem[]
}

export interface GalleryItem {
  slug: string
  imageUrl: string
  imageAlt: string
  label: string
  span: string
  sortOrder: number
}

export interface GallerySection extends SectionHeading {
  items: GalleryItem[]
}

export type TestimonialVariant = "grid" | "carousel"

export interface TestimonialItem {
  slug: string
  name: string
  subtitle: string
  content: string
  rating: number
  avatar?: string
  variant: TestimonialVariant
  sortOrder: number
}

export interface TestimonialsSection extends SectionHeading {
  items: TestimonialItem[]
}

export interface FaqItem {
  slug: string
  question: string
  answer: string
  sortOrder: number
}

export interface FaqSectionData extends SectionHeading {
  ctaText: string
  ctaLabel: string
  ctaMessage: string
  items: FaqItem[]
}

export interface UrgencySectionData extends SectionHeading {
  ctaLabel: string
  ctaMessage: string
  metrics: MetricItem[]
}

export interface FinalCtaSection extends SectionHeading {
  badge: string
  primaryCtaLabel: string
  primaryCtaMessage: string
  secondaryCtaLabel: string
  trustPoints: string[]
}

export interface PackageTier {
  slug: string
  name: string
  tagline: string
  priceLabel: string
  icon: string
  description: string
  features: string[]
  highlighted: boolean
  sortOrder: number
}

export interface PackagesSection extends SectionHeading {
  footerText: string
  footerLinkLabel: string
  items: PackageTier[]
}

export interface CatalogSection extends SectionHeading {
  searchPlaceholder: string
}

export interface ProductCategory {
  id: Category
  name: string
  emoji: string
  sortOrder: number
}

export interface LandingPageData {
  contact: SiteContact
  navigation: NavigationItem[]
  hero: HeroSection
  story: StorySection
  process: ProcessSection
  features: FeaturesSection
  gallery: GallerySection
  testimonials: TestimonialsSection
  faq: FaqSectionData
  urgency: UrgencySectionData
  finalCta: FinalCtaSection
}

export interface SiteChromeData {
  contact: SiteContact
  navigation: NavigationItem[]
}

export interface CatalogData {
  contact: SiteContact
  section: CatalogSection
  categories: ProductCategory[]
  products: Product[]
}
