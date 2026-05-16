"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "#story", label: "Cerita" },
  { href: "#packages", label: "Paket" },
  { href: "#gallery", label: "Galeri" },
  { href: "#testimonials", label: "Testimoni" },
  { href: "#contact", label: "Kontak" },
]

export function SiteNavigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10 md:py-5">
        <a href="#top" className="group flex items-baseline gap-1">
          <span className="font-serif text-2xl tracking-tight text-foreground">daztore</span>
          <span className="font-serif text-2xl tracking-tight text-primary">.id</span>
        </a>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm tracking-wide text-foreground/80 transition-colors duration-300 hover:text-foreground"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a
          href="https://wa.me/6281234567890?text=Halo%20daztore.id%2C%20saya%20tertarik%20dengan%20layanan%20Anda."
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
        >
          Konsultasi Gratis
        </a>

        <button
          aria-label="Toggle menu"
          className="md:hidden rounded-full border border-border/70 bg-card/70 p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur transition-[max-height,opacity] duration-500",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Konsultasi Gratis
          </a>
        </nav>
      </div>
    </header>
  )
}
