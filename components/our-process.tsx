import { Reveal } from "./reveal"
import { CheckCircle2 } from "lucide-react"
import { fallbackProcess } from "@/lib/data/fallback"
import type { ProcessSection } from "@/lib/data/types"

interface OurProcessProps {
  data?: ProcessSection
}

export function OurProcess({ data = fallbackProcess }: OurProcessProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-card/30 to-background py-16 sm:py-24 md:py-32">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {data.items.map((step, i) => (
            <Reveal key={step.slug} delay={i * 0.1}>
              <div className="group rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8 backdrop-blur transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="font-serif text-4xl sm:text-5xl font-semibold text-primary/20 group-hover:text-primary/40 transition-colors">
                    {step.number}
                  </div>
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
