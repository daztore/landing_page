"use client"

import { useState } from "react"
import { Reveal } from "./reveal"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "Berapa lama waktu produksi mahar dan seserahan?",
    answer:
      "Waktu produksi tergantung kompleksitas desain. Untuk mahar standar 7-10 hari, seserahan premium 14-21 hari. Kami juga menerima rush order dengan tambahan biaya.",
  },
  {
    question: "Apakah produk dapat dikustomisasi sesuai keinginan?",
    answer:
      "Ya, semua produk dapat dikustomisasi. Dari pemilihan warna, material, hingga desain khusus. Tim kreatif kami siap mewujudkan visi Anda.",
  },
  {
    question: "Bagaimana dengan jaminan kualitas produk?",
    answer:
      "Setiap produk melalui quality control ketat sebelum dikirim. Kami menggunakan material premium dan pengerjaan profesional. Kepuasan Anda adalah jaminan kami.",
  },
  {
    question: "Bagaimana proses pembayaran dan pengiriman?",
    answer:
      "Pembayaran dapat dilakukan via transfer bank dengan sistem DP+Pelunasan. Pengiriman tersedia untuk seluruh Indonesia dengan packaging premium dan asuransi pengiriman.",
  },
  {
    question: "Apakah ada gratis konsultasi awal?",
    answer:
      "Ya, konsultasi awal sepenuhnya gratis! Hubungi kami via WhatsApp dan tim kami akan membantu merancang paket yang sempurna untuk hari istimewa Anda.",
  },
  {
    question: "Bagaimana jika saya tidak puas dengan hasil?",
    answer:
      "Kami berkomitmen 100% kepuasan pelanggan. Jika ada hal yang perlu diperbaiki, kami akan melakukan revisi sesuai kebutuhan Anda tanpa biaya tambahan.",
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Temukan jawaban untuk pertanyaan paling sering diajukan tentang layanan kami.
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={index} delay={index * 0.05}>
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
              Masih ada pertanyaan? Hubungi kami langsung!
            </p>
            <a
              href="https://wa.me/6287756877555"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm sm:text-base"
            >
              Hubungi via WhatsApp →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
