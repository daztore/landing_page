import {
  CircleHelp,
  Images,
  LayoutTemplate,
  MessageSquareQuote,
  PackageSearch,
  Settings,
  Tags,
} from "lucide-react"

import { AdminCard } from "@/components/admin-daz/admin-card"
import { AdminLinkGrid } from "@/components/admin-daz/admin-link-grid"
import { requireAdmin } from "@/lib/admin-daz/auth"

const links = [
  {
    href: "/admin-daz/landing/sections",
    title: "Landing Page",
    description: "Section dan konten utama",
    icon: LayoutTemplate,
  },
  {
    href: "/admin-daz/landing/gallery",
    title: "Gallery Images",
    description: "Portofolio dan gambar landing",
    icon: Images,
  },
  {
    href: "/admin-daz/catalog/categories",
    title: "Catalog Categories",
    description: "Kategori produk",
    icon: Tags,
  },
  {
    href: "/admin-daz/catalog/products",
    title: "Catalog Products",
    description: "Produk, harga, dan gambar",
    icon: PackageSearch,
  },
  {
    href: "/admin-daz/landing/faqs",
    title: "FAQ",
    description: "Pertanyaan umum",
    icon: CircleHelp,
  },
  {
    href: "/admin-daz/landing/testimonials",
    title: "Testimonials",
    description: "Cerita pelanggan",
    icon: MessageSquareQuote,
  },
  {
    href: "/admin-daz/settings",
    title: "Settings",
    description: "Kontak dan konfigurasi situs",
    icon: Settings,
  },
]

export default async function AdminDashboardPage() {
  const session = await requireAdmin()
  const client = session.client
  const tables = ["products", "gallery_items", "faqs", "testimonials"] as const

  const results = await Promise.all(
    tables.map((table) =>
      client.from(table).select("*", { count: "exact", head: true }).eq("is_active", true),
    ),
  )
  const counts = Object.fromEntries(
    tables.map((table, index) => [table, results[index].count ?? 0]),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600">
          Akses cepat untuk mengelola konten daztore.id.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Produk aktif", counts.products],
          ["Galeri aktif", counts.gallery_items],
          ["FAQ aktif", counts.faqs],
          ["Testimonial aktif", counts.testimonials],
        ].map(([label, value]) => (
          <AdminCard key={String(label)} className="p-3">
            <p className="text-2xl font-bold text-amber-800">{value}</p>
            <p className="mt-1 text-xs text-stone-500">{label}</p>
          </AdminCard>
        ))}
      </div>

      <AdminLinkGrid items={links} />
    </div>
  )
}
