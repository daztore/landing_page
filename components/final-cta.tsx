import { ArrowRight, Clock } from "lucide-react"
import { Reveal } from "@/components/reveal"

export function FinalCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-background py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 20% 40%, oklch(0.9 0.06 80 / 0.55), transparent 60%), radial-gradient(800px 400px at 90% 70%, oklch(0.94 0.04 80 / 0.5), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card px-8 py-14 text-center shadow-2xl shadow-primary/10 md:px-16 md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -bottom-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl"
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
                <Clock className="h-3.5 w-3.5" />
                Hanya 8 slot tersedia bulan ini
              </div>

              <h2 className="mt-7 font-serif text-4xl leading-tight text-foreground text-balance md:text-6xl">
                Mari rangkai
                <span className="block italic text-gold-gradient">kisah Anda bersama.</span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
                Kami hanya menerima jumlah pesanan terbatas setiap bulannya untuk menjaga
                kualitas dan sentuhan personal. Jadwalkan konsultasi Anda hari ini.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20daztore.id%2C%20saya%20ingin%20memesan%20slot%20konsultasi."
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                >
                  Chat via WhatsApp
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a
                  href="mailto:hello@daztore.id"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-8 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
                >
                  hello@daztore.id
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>Respon &lt; 1 jam</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>Konsultasi gratis</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>Pengiriman nasional</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
