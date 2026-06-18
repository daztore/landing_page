"use client"

import { useRouter } from "next/navigation"
import { Search, ArrowLeft } from "lucide-react"

export function KatalogHeader() {
  const router = useRouter()

  return (
    <>
      {/* Mobile simplified header */}
      <div className="fixed inset-x-0 top-0 z-40 md:hidden border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border/60 hover:bg-secondary/50 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <a href="#top" className="font-serif text-lg tracking-tight text-foreground">
              daztore
            </a>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-border/60 hover:bg-secondary/50 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="h-14 md:hidden" />
    </>
  )
}
