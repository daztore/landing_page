import { Check, Crown, Gem, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"
import { fallbackContact, fallbackPackages } from "@/lib/data/fallback"
import type { PackagesSection } from "@/lib/data/types"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

const icons: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  crown: Crown,
  gem: Gem,
}

interface PackagesProps {
  data?: PackagesSection
  whatsappNumber?: string
}

export function Packages({
  data = fallbackPackages,
  whatsappNumber = fallbackContact.whatsappNumber,
}: PackagesProps) {
  return (
    <section id="packages" className="relative bg-secondary/40 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.98 0.012 85) 0%, transparent 100%)",
        }}
      />
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

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {data.items.map((tier, i) => {
            const Icon = icons[tier.icon] ?? Sparkles
            return (
            <Reveal key={tier.slug} delay={i * 120}>
              <article
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-500",
                  tier.highlighted
                    ? "border-primary/50 bg-card shadow-2xl shadow-primary/10 md:-translate-y-4"
                    : "border-border/70 bg-card/80 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5",
                )}
              >
                {tier.highlighted && (
                  <div className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground">
                    Popular
                  </div>
                )}

                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-500 animate-bloom",
                    tier.highlighted
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
                  )}
                  style={{
                    animationDelay: `${i * 200}ms`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 font-serif text-3xl text-foreground">{tier.name}</h3>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-primary">
                  {tier.tagline}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>

                <div className="mt-7 flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">mulai</span>
                  <span className="font-serif text-4xl text-foreground">Rp{tier.priceLabel}</span>
                </div>

                <div className="my-7 h-px w-full bg-border" />

                <ul className="flex flex-col gap-3.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full",
                          tier.highlighted ? "bg-primary/15 text-primary" : "bg-secondary text-primary",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={buildWhatsAppUrl(
                    whatsappNumber,
                    `Halo daztore.id, saya tertarik dengan paket ${tier.name}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "mt-10 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-all duration-300",
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                      : "border border-foreground/20 text-foreground hover:bg-foreground hover:text-background",
                  )}
                >
                  Pilih {tier.name}
                </a>
              </article>
            </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-14 text-center">
          <p className="text-sm text-muted-foreground">
            {data.footerText} <a href="#contact" className="text-primary underline-offset-4 hover:underline">{data.footerLinkLabel}</a>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
