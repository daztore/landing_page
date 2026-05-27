"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "#story", label: "Cerita", disabled: false },
  // { href: "/katalog", label: "Katalog", disabled: false },
  { href: "#packages", label: "Paket", disabled: true, badge: "Coming Soon" },
  { href: "#gallery", label: "Galeri", disabled: false },
  { href: "#testimonials", label: "Testimoni", disabled: false },
  { href: "#contact", label: "Kontak", disabled: false },
]

const mobileBottomLinks = [
  { href: "#top", label: "Beranda", icon: "home" },
  // { href: "/katalog", label: "Katalog", icon: "layout" },
  { href: "#packages", label: "Paket", icon: "package" },
  { href: "#contact", label: "Kontak", icon: "phone" },
]

export function SiteNavigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [isKatalogPage, setIsKatalogPage] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    
    // Check if on katalog page
    setIsKatalogPage(window.location.pathname.includes("/katalog"))
    
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5">
          <a href="#top" className="group flex items-baseline gap-1">
            <span className="font-serif text-xl sm:text-2xl tracking-tight text-foreground">daztore</span>
            <span className="font-serif text-xl sm:text-2xl tracking-tight text-primary">.id</span>
          </a>

          <nav className="hidden md:flex items-center gap-9">
            {links.map((l) => (
              <div key={l.href} className="relative">
                <a
                  href={l.disabled ? "#" : l.href}
                  onClick={(e) => l.disabled && e.preventDefault()}
                  className={cn(
                    "relative text-sm tracking-wide transition-colors duration-300 inline-flex items-center gap-2",
                    l.disabled
                      ? "text-foreground/40 cursor-not-allowed"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {l.label}
                  {l.badge && (
                    <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {l.badge}
                    </span>
                  )}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300",
                    l.disabled ? "w-0" : "w-0 group-hover:w-full",
                  )} />
                </a>
              </div>
            ))}
          </nav>

          <a
            href="/katalog"
              // target="_blank"
              // rel="noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            Katalog
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
            open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="flex flex-col gap-1 px-4 py-3 sm:px-6 sm:py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.disabled ? "#" : l.href}
                onClick={(e) => {
                  if (l.disabled) e.preventDefault()
                  else setOpen(false)
                }}
                className={cn(
                  "rounded-md px-3 py-3 text-sm transition-colors flex items-center justify-between",
                  l.disabled
                    ? "text-foreground/40 cursor-not-allowed"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                )}
              >
                <span>{l.label}</span>
                {l.badge && (
                  <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {l.badge}
                  </span>
                )}
              </a>
            ))}
            <a
              href="/katalog"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              Katalog
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile bottom navigation - hidden on katalog page */}
      {!isKatalogPage && (
        <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <nav className="flex items-center justify-around px-2 py-2">
          <a
            href="#top"
            className="flex flex-col items-center gap-1 px-3 py-2.5 text-xs text-foreground/70 transition-colors hover:text-primary"
          >
            <span className="text-lg">🏠</span>
            <span>Beranda</span>
          </a>
          <a
            href="/katalog"
            className="flex flex-col items-center gap-1 px-3 py-2.5 text-xs text-foreground/70 transition-colors hover:text-primary"
          >
            <span className="text-lg">📦</span>
            <span>Katalog</span>
          </a>
          <a
            href="#packages"
            className="flex flex-col items-center gap-1 px-3 py-2.5 text-xs text-foreground/70 transition-colors hover:text-primary"
          >
            <span className="text-lg">💎</span>
            <span>Paket</span>
          </a>
          <a
            href="https://wa.me/628775687555"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 px-3 py-2.5 text-xs text-foreground/70 transition-colors hover:text-primary"
          >
            <span className="text-lg">💬</span>
            <span>Chat</span>
          </a>
        </nav>
        </div>
      )}

      {/* Spacer for bottom nav on mobile - hidden on katalog page */}
      {!isKatalogPage && <div className="h-20 md:hidden" />}
    </>
  )
}
