"use client"

import { Reveal } from "./reveal"
import { Calendar, AlertCircle, ArrowRight } from "lucide-react"

export function UrgencySection() {
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
                  Slot Terbatas Setiap Bulan
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Kami hanya menerima 8 pasang baru per bulan untuk menjamin kualitas dan perhatian penuh kepada setiap detail.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
              <div className="rounded-lg bg-primary/10 px-4 py-3 text-center">
                <div className="font-serif text-2xl font-semibold text-primary mb-1">
                  500+
                </div>
                <p className="text-xs text-muted-foreground">Pasangan Puas</p>
              </div>
              <div className="rounded-lg bg-primary/10 px-4 py-3 text-center">
                <div className="font-serif text-2xl font-semibold text-primary mb-1">
                  4.9/5
                </div>
                <p className="text-xs text-muted-foreground">Rating Premium</p>
              </div>
              <div className="rounded-lg bg-primary/10 px-4 py-3 text-center">
                <div className="font-serif text-2xl font-semibold text-primary mb-1">
                  24/7
                </div>
                <p className="text-xs text-muted-foreground">Support</p>
              </div>
            </div>

            <a
              href="https://wa.me/6287756877555?text=Halo%20daztore.id%2C%20saya%20tertarik%20dengan%20layanan%20Anda.%20Apakah%20masih%20ada%20slot%3F"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Calendar className="h-4 w-4" />
              Cek Ketersediaan Slot
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
