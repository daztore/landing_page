import { Reveal } from "./reveal"
import { Calendar, AlertCircle, ArrowRight } from "lucide-react"
import { fallbackContact, fallbackUrgency } from "@/lib/data/fallback"
import type { UrgencySectionData } from "@/lib/data/types"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

interface UrgencySectionProps {
  data?: UrgencySectionData
  whatsappNumber?: string
}

export function UrgencySection({
  data = fallbackUrgency,
  whatsappNumber = fallbackContact.whatsappNumber,
}: UrgencySectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/0 to-primary/5 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="rounded-2xl border border-primary/30 bg-card/50 p-6 sm:p-8 md:p-10 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/15 text-primary">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-2">
                  {data.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {data.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
              {data.metrics.map((metric) => (
                <div key={metric.slug} className="rounded-lg bg-primary/10 px-4 py-3 text-center">
                  <div className="font-serif text-2xl font-semibold text-primary mb-1">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>

            <a
              href={buildWhatsAppUrl(whatsappNumber, data.ctaMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Calendar className="h-4 w-4" />
              {data.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
