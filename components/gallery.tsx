"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"
import { fallbackGallery } from "@/lib/data/fallback"
import type { GallerySection } from "@/lib/data/types"

interface GalleryProps {
  data?: GallerySection
}

export function Gallery({ data = fallbackGallery }: GalleryProps) {
  const items = data.items
  const [loaded, setLoaded] = useState<boolean[]>(Array(items.length).fill(false))
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null)
      if (e.key === "ArrowRight") setActive((v) => (v === null ? null : (v + 1) % items.length))
      if (e.key === "ArrowLeft")
        setActive((v) => (v === null ? null : (v - 1 + items.length) % items.length))
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [active])

  return (
    <section id="gallery" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 divider-ornament">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">{data.eyebrow}</span>
          </div>
          <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
            {data.title}
            <span className="block italic text-gold-gradient">{data.highlightedTitle}</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            {data.description}
          </p>
        </Reveal>

        <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:auto-rows-[260px]">
          {items.map((item, i) => (
            <Reveal key={item.slug} delay={i * 80} className={cn("group relative", item.span)}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="relative h-full w-full overflow-hidden rounded-2xl border border-border/70 bg-secondary text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                {!loaded[i] && (
                  <div aria-hidden className="absolute inset-0 shimmer" />
                )}
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 33vw, 50vw"
                  onLoad={() =>
                    setLoaded((prev) => {
                      const next = [...prev]
                      next[i] = true
                      return next
                    })
                  }
                  className={cn(
                    "object-cover transition-all duration-700",
                    loaded[i] ? "opacity-100 scale-100" : "opacity-0 scale-105",
                    "group-hover:scale-[1.04]",
                  )}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-primary-foreground/80">
                    Daztore Portfolio
                  </div>
                  <div className="mt-1 font-serif text-lg text-primary-foreground">
                    {item.label}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeri"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-md"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Tutup"
            className="absolute right-5 top-5 rounded-full bg-background/90 p-2 text-foreground transition hover:scale-105"
            onClick={() => setActive(null)}
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-3 text-foreground transition hover:scale-105 md:left-6"
            onClick={(e) => {
              e.stopPropagation()
              setActive((v) => (v === null ? null : (v - 1 + items.length) % items.length))
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-3 text-foreground transition hover:scale-105 md:right-6"
            onClick={(e) => {
              e.stopPropagation()
              setActive((v) => (v === null ? null : (v + 1) % items.length))
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className="relative aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-2xl md:aspect-[3/4]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={items[active].imageUrl}
              alt={items[active].imageAlt}
              fill
              sizes="80vw"
              className="object-cover"
            />
            <div className="absolute inset-x-6 bottom-6 rounded-xl bg-background/85 px-5 py-3 backdrop-blur">
              <div className="text-[10px] uppercase tracking-[0.22em] text-primary">
                {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </div>
              <div className="font-serif text-lg text-foreground">{items[active].label}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
