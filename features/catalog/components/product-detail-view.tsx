import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageCircle,
  Palette,
  Sparkles,
  Tag,
} from "lucide-react"

import type { SiteContact } from "@/lib/data/types"
import { getSafeImageSrc } from "@/lib/security/safe-image-src"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import type { ProductDetail } from "@/features/catalog/types"

interface ProductDetailViewProps {
  product: ProductDetail
  contact: SiteContact
  inquiryContent?: ReactNode
}

const badgeLabel: Record<NonNullable<ProductDetail["badge"]>, string> = {
  bestseller: "Best Seller",
  limited: "Limited Edition",
  loved: "Most Loved",
}

function ProductFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary">{icon}</div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function ProductDetailView({
  product,
  contact,
  inquiryContent,
}: ProductDetailViewProps) {
  const productImage = getSafeImageSrc(product.image.src) || "/gallery-1.jpg"
  const whatsappUrl = buildWhatsAppUrl(contact.whatsappNumber, product.inquiry.defaultMessage)
  const consultationHref = inquiryContent ? "#inquiry" : whatsappUrl
  const availabilityLabel = product.available
    ? "Tersedia untuk konsultasi"
    : "Slot atau stok terbatas"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-10">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden min-[360px]:inline">Katalog</span>
          </Link>

          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-serif text-xl text-foreground sm:text-2xl">
              {contact.brandName}
            </span>
            <span className="font-serif text-xl text-primary sm:text-2xl">
              {contact.brandSuffix}
            </span>
          </Link>

          <a
            href={consultationHref}
            target={inquiryContent ? undefined : "_blank"}
            rel={inquiryContent ? undefined : "noreferrer"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Konsultasi</span>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-7xl gap-7 px-4 pb-10 pt-5 sm:px-6 sm:pb-14 md:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] md:gap-10 md:px-10 md:pt-10">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border/60 bg-secondary sm:aspect-[5/4] md:aspect-[4/5]">
              <Image
                src={productImage}
                alt={product.image.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 52vw"
                className="object-cover"
              />
              {product.badge && (
                <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                  {badgeLabel[product.badge]}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ProductFact
                icon={<Tag className="h-4 w-4" />}
                label="Kategori"
                value={product.category.name}
              />
              <ProductFact
                icon={<Clock className="h-4 w-4" />}
                label="Pengerjaan"
                value={product.processingTime}
              />
              <ProductFact
                icon={<Sparkles className="h-4 w-4" />}
                label="Status"
                value={availabilityLabel}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="border-b border-border/60 pb-5">
              <p className="text-sm font-medium text-primary">{product.category.name}</p>
              <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {product.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="border-b border-border/60 py-5">
              <p className="text-sm text-muted-foreground">Estimasi harga</p>
              <p className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
                {product.price.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Harga bersifat estimasi dan belum menjadi invoice final. Tim admin akan
                mengonfirmasi detail custom, jadwal produksi, dan kebutuhan acara sebelum order
                manual dibuat.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 border-b border-border/60 py-5 sm:grid-cols-2">
              <ProductFact
                icon={<Palette className="h-4 w-4" />}
                label="Kustomisasi"
                value={product.customizable ? "Bisa disesuaikan" : "Mengikuti desain katalog"}
              />
              <ProductFact
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Alur berikutnya"
                value="Konsultasi admin"
              />
            </div>

            <div className="hidden gap-3 pt-6 sm:flex">
              <a
                href={consultationHref}
                target={inquiryContent ? undefined : "_blank"}
                rel={inquiryContent ? undefined : "noreferrer"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" />
                Isi form inquiry
              </a>
              <Link
                href="/katalog"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-border/70 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60"
              >
                Lihat katalog lain
              </Link>
            </div>

            <div id="inquiry" className="scroll-mt-24 pt-6">
              {inquiryContent ?? (
                <div className="rounded-lg border border-border/60 bg-card p-4">
                  <p className="font-serif text-xl font-semibold text-foreground">
                    Konsultasi produk
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Hubungi admin untuk memastikan detail custom dan estimasi.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Konsultasi via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-border/60 bg-background/95 p-4 backdrop-blur sm:hidden">
        <a
          href={consultationHref}
          target={inquiryContent ? undefined : "_blank"}
          rel={inquiryContent ? undefined : "noreferrer"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          Isi form inquiry
        </a>
      </div>
    </div>
  )
}
