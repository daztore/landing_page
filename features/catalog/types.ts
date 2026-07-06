import type { Category, Product } from "@/lib/data/types"

export interface ProductDetail {
  slug: string
  title: string
  category: {
    slug: Category
    name: string
  }
  description: string
  price: {
    start: number
    end?: number
    label: string
    isEstimate: true
  }
  image: {
    src: string
    alt: string
  }
  badge?: Product["badge"]
  processingTime: string
  customizable: boolean
  available: boolean
  inquiry: {
    defaultMessage: string
  }
}

export interface ProductSitemapEntry {
  slug: string
  updatedAt?: Date
}
