"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => setOffset(Math.min(window.scrollY * 0.3, 200))
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-background pt-28 pb-20 md:pt-36 md:pb-28"
    >
      {/* Soft background gradient */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 85% 0%, oklch(0.9 0.06 80 / 0.55), transparent 60%), radial-gradient(900px 500px at 10% 100%, oklch(0.94 0.04 80 / 0.6), transparent 60%)",
        }}
      />

      {/* Decorative floating elements */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[4%] top-[18%] h-24 w-24 rounded-full border border-primary/30 animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] bottom-[10%] h-32 w-32 rounded-full border border-primary/20 animate-float-slow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-12 md:px-10">
        {/* Copy */}
        <div className="md:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/60 px-4 py-1.5 text-xs tracking-[0.18em] uppercase text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Wedding Atelier
          </div>

          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-foreground text-balance md:text-7xl">
            Setiap cinta layak
            <span className="block italic text-gold-gradient">dirayakan dengan indah.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            daztore.id menghadirkan mahar, seserahan, dan flower bouquet yang dirancang
            dengan ketelitian, keanggunan, dan sentuhan personal — untuk hari paling
            berharga dalam hidup Anda.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="https://wa.me/6281234567890?text=Halo%20daztore.id%2C%20saya%20tertarik%20dengan%20layanan%20Anda."
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
            >
              Mulai Konsultasi
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#packages"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-transparent px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
            >
              Lihat Paket
            </a>
          </div>

          {/* Trust stats */}
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-8">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Couples</dt>
              <dd className="mt-1 font-serif text-2xl text-foreground">500+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Rating</dt>
              <dd className="mt-1 font-serif text-2xl text-foreground">4.9 / 5</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Tahun</dt>
              <dd className="mt-1 font-serif text-2xl text-foreground">7+</dd>
            </div>
          </dl>
        </div>

        {/* Visual */}
        <div className="relative md:col-span-6">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/10"
            style={{ transform: `translateY(-${offset * 0.15}px)` }}
          >
            <Image
              src="/hero-mahar.jpg"
              alt="Mahar pernikahan premium dengan bunga mawar putih dan aksen emas"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 55%, oklch(0.25 0.025 45 / 0.55) 100%)",
              }}
            />
            <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl bg-background/85 px-5 py-4 backdrop-blur">
              <div>
                <div className="font-serif text-sm text-foreground">Signature Collection</div>
                <div className="text-xs text-muted-foreground">Handcrafted with love</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Floating accent card */}
          <div
            className="absolute -left-4 top-10 hidden rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-xl backdrop-blur md:block"
            style={{ transform: `translateY(${offset * 0.08}px)` }}
          >
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary">Limited</div>
            <div className="mt-1 font-serif text-base text-foreground">
              Hanya 8 slot / bulan
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
