"use client"

import { Reveal } from "./reveal"

const testimonials = [
  {
    name: "Sarah & Reza",
    location: "Jakarta",
    content: "daztore.id berhasil mewujudkan setiap detail visi kami. Dari mahar hingga seserahan, semuanya sempurna dan melampaui ekspektasi!",
    rating: 5,
    image: "👰",
  },
  {
    name: "Dewi & Aldi",
    location: "Surabaya",
    content: "Tim daztore sangat profesional, responsif, dan mendengarkan setiap masukan kami. Hasil akhirnya benar-benar magical!",
    rating: 5,
    image: "💍",
  },
  {
    name: "Ayu & Hari",
    location: "Bandung",
    content: "Proses kustomisasi yang smooth, komunikasi yang jelas, dan hasil yang memukau. Terima kasih sudah membuat hari kami sempurna!",
    rating: 5,
    image: "🌹",
  },
]

export function TestimonialsEnhanced() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-card/20 to-background py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance mb-4">
              Cerita Pasangan Bahagia
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Ribuan pasangan telah mempercayai daztore.id untuk mewujudkan hari istimewa mereka.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, i) => (
            <Reveal key={testimonial.name} delay={i * 0.1}>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8 backdrop-blur">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-xl">⭐</span>
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-serif text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
