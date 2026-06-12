import { PackageSearch, Tags } from "lucide-react"

import { AdminLinkGrid } from "@/components/admin-daz/admin-link-grid"

export default function AdminCatalogPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Katalog</h1>
        <p className="mt-1 text-sm text-stone-600">
          Kelola kategori dan produk yang tampil pada katalog publik.
        </p>
      </div>
      <AdminLinkGrid
        items={[
          {
            href: "/admin-daz/catalog/categories",
            title: "Kategori",
            description: "Nama, slug, emoji, status, dan urutan",
            icon: Tags,
          },
          {
            href: "/admin-daz/catalog/products",
            title: "Produk",
            description: "Produk, harga, badge, gambar, dan ketersediaan",
            icon: PackageSearch,
          },
        ]}
      />
    </div>
  )
}
