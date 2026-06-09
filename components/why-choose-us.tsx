"use client"

import { Reveal } from "./reveal"
import { Award, Heart, Zap, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { fallbackFeatures } from "@/lib/data/fallback"
import type { FeaturesSection } from "@/lib/data/types"

const icons: Record<string, LucideIcon> = {
  award: Award,
  heart: Heart,
  zap: Zap,
  users: Users,
}

interface WhyChooseUsProps {
  data?: FeaturesSection
}

export function WhyChooseUs({ data = fallbackFeatures }: WhyChooseUsProps) {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance mb-4">
              {data.title}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {data.description}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {data.items.map((reason, i) => {
            const Icon = icons[reason.icon] ?? Heart
            return (
              <Reveal key={reason.slug} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="inline-flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-6 sm:h-7 w-6 sm:w-7" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
