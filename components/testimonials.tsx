"use client"

import { useEffect, useState } from "react"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"

type Testimonial = {
  name: string
  role: string
  rating: number
  body: string
}

const testimonials: Testimonial[] = [
  {
    name: "Anindya & Rizki",
    role: "Menikah, Mei 2024",
    rating: 5,
    body: "daztore.id memahami visi kami bahkan sebelum kami menjelaskan semuanya. Setiap detail mahar terasa seperti cerminan cinta kami. Tamu-tamu tidak berhenti memuji!",
  },
  {
    name: "Kirana & Aldo",
    role: "Menikah, Agustus 2024",
    rating: 5,
    body: "Seserahan yang dibuat benar-benar breathtaking. Tim mereka sangat sabar, detail, dan menghadirkan hasil yang melampaui ekspektasi. Worth every penny.",
  },
  {
    name: "Nadira & Fariz",
    role: "Menikah, November 2023",
    rating: 5,
    body: "Bouquet dari daztore.id masih saya simpan sampai sekarang — indahnya tidak lekang oleh waktu. Pelayanan personal yang sulit ditemukan di tempat lain.",
  },
  {
    name: "Salma & Bima",
    role: "Menikah, Februari 2025",
    rating: 5,
    body: "Proses dari konsultasi hingga hari H sangat mulus. Mereka benar-benar mengangkat cerita kami menjadi sesuatu yang visual dan emosional.",
  },
]

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(id)
  }, [paused])

  const prev = () => setIndex((v) => (v - 1 + testimonials.length) % testimonials.length)
  const next = () => setIndex((v) => (v + 1) % testimonials.length)

  return (
    <section id="testimonials" className="relative overflow-hidden bg-secondary/40 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, oklch(0.9 0.06 80 / 0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 divider-ornament">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">Kind Words</span>
          </div>
          <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
            Dipercaya oleh pasangan
            <span className="block italic text-gold-gradient">yang istimewa.</span>
          </h2>
        </Reveal>

        <Reveal delay={150} className="mt-14">
          <div
            className="relative rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-xl shadow-primary/5 md:p-14"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <Quote className="absolute left-6 top-6 h-10 w-10 text-primary/20 md:left-10 md:top-10" />

            <div className="relative min-h-[240px] md:min-h-[200px]">
              {testimonials.map((t, i) => (
                <article
                  key={t.name}
                  aria-hidden={i !== index}
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700",
                    i === index
                      ? "opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 translate-y-3",
                  )}
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-foreground text-pretty md:text-2xl">
                    &ldquo;{t.body}&rdquo;
                  </p>

                  <div className="mt-8">
                    <div className="font-serif text-base text-foreground">{t.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label="Testimoni sebelumnya"
                onClick={prev}
                className="rounded-full border border-border bg-background p-2.5 text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ke testimoni ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === index ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-primary/50",
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Testimoni berikutnya"
                onClick={next}
                className="rounded-full border border-border bg-background p-2.5 text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
