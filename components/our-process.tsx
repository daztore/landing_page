"use client"

import { Reveal } from "./reveal"
import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Konsultasi Mendalam",
    description: "Kami mendengarkan visi, preferensi, dan setiap detail impian pernikahan Anda dengan penuh perhatian.",
  },
  {
    number: "02",
    title: "Desain & Proposal",
    description: "Tim kreatif kami merancang konsep yang sempurna, dari warna hingga setiap elemen dekorasi.",
  },
  {
    number: "03",
    title: "Produksi Premium",
    description: "Setiap produk dikerjakan dengan keahlian tinggi, material berkualitas, dan sentuhan personal.",
  },
  {
    number: "04",
    title: "Finalisasi & Pengiriman",
    description: "Inspeksi kualitas akhir dan pengiriman tepat waktu memastikan kesempurnaan hari Anda.",
  },
]

export function OurProcess() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-card/30 to-background py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance mb-4">
              Proses Kami
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Dari visi menjadi kenyataan dalam empat langkah sempurna yang dirancang untuk kesuksesan hari istimewa Anda.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.1}>
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
