import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { FloatingFlower } from "./floating-flower"
import { fallbackContact, fallbackHero } from "@/lib/data/fallback"
import type { HeroSection } from "@/lib/data/types"
import { getSafeImageSrc } from "@/lib/security/safe-image-src"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

interface HeroProps {
  data?: HeroSection
  whatsappNumber?: string
}

export function Hero({
  data = fallbackHero,
  whatsappNumber = fallbackContact.whatsappNumber,
}: HeroProps) {
  const heroImage = getSafeImageSrc(data.imageUrl) || fallbackHero.imageUrl
  const mobileBackground =
    getSafeImageSrc(data.mobileBackgroundUrl) || fallbackHero.mobileBackgroundUrl

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-background pt-20 pb-10 sm:pt-24 sm:pb-14 md:pt-36 md:pb-28"
    >
      {/* Mobile-only bouquet background with elegant overlays */}
      <div className="absolute inset-0 -z-10 md:hidden overflow-hidden">
        {/* Bouquet background image - mobile only */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${mobileBackground}')`,
            opacity: 0.25,
          }}
        />
        
        {/* Gradient overlay for elegance and readability */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, oklch(0.97 0.02 80 / 0.7) 0%, oklch(0.95 0.03 75 / 0.5) 50%, oklch(0.92 0.04 70 / 0.6) 100%),
              linear-gradient(180deg, oklch(0.98 0.01 80 / 0.8) 0%, oklch(0.96 0.02 80 / 0.4) 100%)
            `,
          }}
        />
        
        {/* Soft vignette fade for premium feel */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at center, transparent 0%, oklch(0.25 0.02 80 / 0.15) 100%)
            `,
          }}
        />
      </div>

      {/* Desktop gradient background - unchanged */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden md:block"
        style={{
          background:
            "radial-gradient(1200px 600px at 85% 0%, oklch(0.9 0.06 80 / 0.55), transparent 60%), radial-gradient(900px 500px at 10% 100%, oklch(0.94 0.04 80 / 0.6), transparent 60%)",
        }}
      />

      {/* Subtle falling petals */}
      <FloatingFlower delay={0} duration={7} xStart={-100} className="left-[15%] top-0" />
      <FloatingFlower delay={1.5} duration={8} xStart={50} className="left-[35%] top-0" />
      <FloatingFlower delay={3} duration={7.5} xStart={-30} className="right-[20%] top-0" />

      {/* Decorative floating elements */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[4%] top-[18%] h-16 w-16 sm:h-24 sm:w-24 rounded-full border border-primary/30 animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] bottom-[10%] h-20 w-20 sm:h-32 sm:w-32 rounded-full border border-primary/20 animate-float-slow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 sm:gap-10 sm:px-6 md:grid-cols-12 md:gap-14 md:px-10">
        {/* Copy */}
        <div className="md:col-span-6">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-primary backdrop-blur sm:px-4 sm:text-xs">
            <Sparkles className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            {data.badge}
          </div>

          <h1 className="hero-headline mt-4 font-serif text-[2rem] leading-[1.1] tracking-tight text-foreground text-balance sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
            {data.title}
            <span className="block italic text-gold-gradient">{data.highlightedTitle}</span>
          </h1>

          <p className="hero-description mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty sm:mt-6 sm:text-base md:text-lg">
            {data.description}
          </p>

          <div className="hero-ctas mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <a
              href={buildWhatsAppUrl(whatsappNumber, data.primaryCtaMessage)}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 active:translate-y-0 sm:w-auto sm:px-7 sm:py-3.5"
            >
              {data.primaryCtaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href={data.secondaryCtaHref}
              className="inline-flex self-start items-center justify-center gap-2 rounded-full border border-foreground/20 bg-background/75 px-6 py-3 text-sm font-medium text-foreground/85 transition-all duration-300 hover:bg-foreground hover:text-background sm:self-auto sm:px-7 sm:py-3.5"
            >
              {data.secondaryCtaLabel}
            </a>
          </div>

          <dl className="hero-stats mt-5 flex flex-wrap gap-2 md:hidden">
            {data.metrics.map((metric) => (
              <div
                key={metric.slug}
                className="rounded-full border border-border/70 bg-card/75 px-3 py-2 backdrop-blur"
              >
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {metric.label}
                </dt>
                <dd className="mt-1 font-serif text-base text-foreground">{metric.value}</dd>
              </div>
            ))}
          </dl>

          {/* Trust stats */}
          <dl className="hero-stats mt-12 hidden max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-8 md:grid">
            {data.metrics.map((metric) => (
              <div key={metric.slug}>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{metric.label}</dt>
                <dd className="mt-1 font-serif text-2xl text-foreground">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="hero-visual relative md:col-span-6">
          <div
            className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-lg shadow-primary/10 sm:aspect-[4/5] sm:rounded-[2rem] sm:shadow-2xl"
          >
            <Image
              src={heroImage}
              alt={data.imageAlt}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 55%, oklch(0.25 0.025 45 / 0.55) 100%)",
              }}
            />
            <div className="absolute inset-x-3 sm:inset-x-6 bottom-3 sm:bottom-6 flex items-center justify-between rounded-xl sm:rounded-2xl bg-background/85 px-3 sm:px-5 py-3 sm:py-4 backdrop-blur">
              <div>
                <div className="font-serif text-xs sm:text-sm text-foreground">{data.collectionTitle}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{data.collectionSubtitle}</div>
              </div>
              <div className="h-9 sm:h-10 w-9 sm:w-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Floating accent card - hidden on mobile */}
          <div
            className="absolute -left-4 top-10 hidden rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-xl backdrop-blur md:block"
          >
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary">{data.accentLabel}</div>
            <div className="mt-1 font-serif text-base text-foreground">
              {data.accentValue}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
