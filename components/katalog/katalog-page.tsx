"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { sortOptions, type Category } from "@/lib/katalog-data"
import { fallbackCatalog } from "@/lib/data/fallback"
import type { CatalogData } from "@/lib/data/types"
import { ProductCard } from "./product-card"

// Hide bottom navigation on katalog page
declare global {
  interface Window {
    hideBottomNav?: boolean
  }
}

interface KatalogPageProps {
  data?: CatalogData
}

export function KatalogPage({ data = fallbackCatalog }: KatalogPageProps) {
  const { categories, products, section, contact } = data
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    }

    // Sorting
    const sorted = [...filtered]
    switch (sortBy) {
      case "popular":
        sorted.sort((a, b) => {
          const badgeOrder = { bestseller: 0, loved: 1, limited: 2, undefined: 3 }
          return (badgeOrder[a.badge as keyof typeof badgeOrder] || 3) -
                 (badgeOrder[b.badge as keyof typeof badgeOrder] || 3)
        })
        break
      case "price-asc":
        sorted.sort((a, b) => a.startPrice - b.startPrice)
        break
      case "price-desc":
        sorted.sort((a, b) => b.startPrice - a.startPrice)
        break
      case "premium":
        sorted.sort((a, b) => b.startPrice - a.startPrice)
        break
    }

    return sorted
  }, [selectedCategory, searchQuery, sortBy])

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <section className="border-b border-border/60 bg-gradient-to-b from-card/50 to-background py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground text-balance">
              {section.title}
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {section.description}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={section.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground"
          >
            🎯 Filter {selectedCategory !== "all" && "(1)"}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Sort & Categories */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <h2 className="font-serif text-lg text-foreground">Kategori</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-background/95 backdrop-blur transition-opacity md:static md:relative md:bg-transparent md:backdrop-blur-none",
              showFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
            )}
          >
            {/* Mobile close button */}
            <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background px-4 py-3 md:hidden">
              <span className="font-serif text-lg text-foreground">Kategori</span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 md:p-0 space-y-2 max-h-[80vh] overflow-y-auto md:max-h-none">
              {/* All categories button */}
              <button
                onClick={() => {
                  setSelectedCategory("all")
                  setShowFilters(false)
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-card text-foreground/80 hover:text-foreground"
                )}
              >
                Semua Kategori
              </button>

              {/* Category buttons */}
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as Category)
                    setShowFilters(false)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-card text-foreground/80 hover:text-foreground"
                  )}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsappNumber={contact.whatsappNumber}
                    />
                  ))}
                </div>
                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Menampilkan {filteredProducts.length} produk
                </p>
              </>
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-muted-foreground mb-3">Tidak ada produk ditemukan</p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Coba reset filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
