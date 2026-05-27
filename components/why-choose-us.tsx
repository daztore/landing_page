"use client"

import { Reveal } from "./reveal"
import { Award, Heart, Zap, Users } from "lucide-react"

const reasons = [
  {
    icon: Award,
    title: "Kualitas Premium",
    description: "Setiap produk dipilih dan dirancang dengan standar kualitas tertinggi untuk kesempurnaan maksimal.",
  },
  {
    icon: Heart,
    title: "Sentuhan Personal",
    description: "Kami memahami setiap cerita cinta Anda dan mengubahnya menjadi sesuatu yang unik dan berkesan.",
  },
  {
    icon: Zap,
    title: "Pengerjaan Cepat",
    description: "Proses produksi yang efisien tanpa mengorbankan kualitas, cocok untuk timeline yang ketat.",
  },
  {
    icon: Users,
    title: "Tim Berpengalaman",
    description: "Lebih dari 7 tahun melayani ratusan pasangan dengan dedikasi dan profesionalisme tinggi.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance mb-4">
              Mengapa Memilih daztore.id
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Kami adalah mitra terpercaya untuk mewujudkan setiap detail impian pernikahan Anda dengan sempurna.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {reasons.map((reason, i) => {
            const Icon = reason.icon
            return (
              <Reveal key={reason.title} delay={i * 0.1}>
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
