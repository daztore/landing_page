"use client"

import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

export function KatalogHeader() {
  function focusSearch() {
    const searchInput = document.getElementById("catalog-search")
    searchInput?.scrollIntoView({ behavior: "smooth", block: "center" })
    searchInput?.focus({ preventScroll: true })
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-secondary/50"
            aria-label="Kembali ke beranda"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1">
            <a href="#top" className="font-serif text-lg tracking-tight text-foreground">
              daztore
            </a>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-secondary/50"
            aria-label="Cari produk"
            onClick={focusSearch}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-14 md:hidden" />
    </>
  )
}
