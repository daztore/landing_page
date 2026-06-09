"use client"

import { useState } from "react"
import { Reveal } from "./reveal"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { fallbackContact, fallbackFaq } from "@/lib/data/fallback"
import type { FaqSectionData } from "@/lib/data/types"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

interface FaqSectionProps {
  data?: FaqSectionData
  whatsappNumber?: string
}

export function FaqSection({
  data = fallbackFaq,
  whatsappNumber = fallbackContact.whatsappNumber,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance mb-4">
              {data.title}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              {data.description}
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {data.items.map((faq, index) => (
            <Reveal key={faq.slug} delay={index * 0.05}>
              <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden transition-all duration-300 hover:border-primary/30">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left transition-colors hover:bg-card/70"
                >
                  <span className="font-serif text-base sm:text-lg text-foreground font-semibold pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300",
                      openIndex === index && "rotate-180"
                    )}
                  />
                </button>

                {openIndex === index && (
                  <div className="border-t border-border/60 px-5 sm:px-6 py-4 sm:py-5 bg-card/30">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              {data.ctaText}
            </p>
            <a
              href={buildWhatsAppUrl(whatsappNumber, data.ctaMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm sm:text-base"
            >
              {data.ctaLabel}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
