import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailView, getProductDetailBySlug } from "@/features/catalog"
import { getSiteChromeData } from "@/lib/data/landing-page"

export const revalidate = 300

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

function truncateDescription(description: string) {
  return description.length > 155 ? `${description.slice(0, 152).trim()}...` : description
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductDetailBySlug(slug)

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | daztore.id",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = truncateDescription(product.description)
  const canonical = `/produk/${product.slug}`

  return {
    title: `${product.title} | daztore.id`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${product.title} | daztore.id`,
      description,
      url: canonical,
      siteName: "daztore.id",
      images: [
        {
          url: product.image.src,
          alt: product.image.alt,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | daztore.id`,
      description,
      images: [product.image.src],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, chrome] = await Promise.all([
    getProductDetailBySlug(slug),
    getSiteChromeData(),
  ])

  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} contact={chrome.contact} />
}
