"use client"

import Image from "next/image"
import { Heart, Clock, Palette } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { type Product } from "@/lib/katalog-data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.startPrice)

  const endPriceText = product.endPrice
    ? ` - ${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(product.endPrice)}`
    : ""

  const badgeLabel = {
    bestseller: "Best Seller",
    limited: "Limited Edition",
    loved: "Most Loved",
  }

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur text-primary-foreground text-[10px] font-semibold tracking-wide uppercase">
            {badgeLabel[product.badge]}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur p-2 text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          aria-label="Add to favorites"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isFavorite ? "fill-current text-red-500" : ""
            )}
          />
        </button>

        {/* Hover Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Hover CTA */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 transition-all duration-300 translate-y-4 opacity-0",
            isHovered && "translate-y-0 opacity-100"
          )}
        >
          <a
            href={`https://wa.me/628775687555?text=Halo%20daztore.id%2C%20saya%20tertarik%20dengan%20${encodeURIComponent(product.title)}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            Konsultasi Via WhatsApp
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground line-clamp-2 mb-2">
          {product.title}
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-3">
          <p className="text-sm sm:text-base font-semibold text-foreground">
            Mulai dari {formattedPrice}
            {endPriceText && (
              <span className="text-xs text-muted-foreground block">{endPriceText}</span>
            )}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{product.processingTime}</span>
          </div>
          {product.customizable && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Palette className="h-4 w-4 flex-shrink-0" />
              <span>Dapat dikustomisasi</span>
            </div>
          )}
        </div>

        {/* Availability Badge */}
        {!product.availability && (
          <div className="rounded-lg bg-yellow-500/10 px-3 py-1.5 text-[10px] font-semibold text-yellow-700 uppercase tracking-wide">
            Terbatas
          </div>
        )}
      </div>
    </div>
  )
}
