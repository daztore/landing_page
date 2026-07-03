import Image from "next/image"
import { Reveal } from "@/components/reveal"
import { Heart, Flower2, Gem } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { fallbackStory } from "@/lib/data/fallback"
import type { StorySection } from "@/lib/data/types"
import { getSafeImageSrc } from "@/lib/security/safe-image-src"

const icons: Record<string, LucideIcon> = {
  heart: Heart,
  flower: Flower2,
  gem: Gem,
}

interface StoryProps {
  data?: StorySection
}

export function Story({ data = fallbackStory }: StoryProps) {
  const imageSrc = getSafeImageSrc(data.imageUrl) || fallbackStory.imageUrl

  return (
    <section id="story" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-xl">
              <Image
                src={imageSrc}
                alt={data.imageAlt}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-secondary px-6 py-5 shadow-lg md:block">
              <div className="font-serif text-2xl text-foreground">{data.establishedLabel}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                {data.locationLabel}
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <div className="flex items-center gap-3 divider-ornament">
                <span className="text-xs uppercase tracking-[0.25em] text-primary">
                  {data.eyebrow}
                </span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
                {data.title}{" "}
                <span className="block italic text-gold-gradient">{data.highlightedTitle}</span>
              </h2>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                {data.description}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                {data.secondaryDescription}
              </p>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {data.values.map((value, i) => {
                const Icon = icons[value.icon] ?? Heart
                return (
                <Reveal key={value.slug} delay={400 + i * 100}>
                  <div className="group h-full rounded-2xl border border-border/70 bg-card/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 font-serif text-base text-foreground">{value.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
