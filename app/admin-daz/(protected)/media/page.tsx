import { Images, PackageSearch } from "lucide-react"

import { AdminLinkGrid } from "@/components/admin-daz/admin-link-grid"

export default function AdminMediaPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Media</h1>
        <p className="mt-1 text-sm text-stone-600">
          Upload dan kelola referensi gambar melalui resource terkait.
        </p>
      </div>
      <AdminLinkGrid
        items={[
          {
            href: "/admin-daz/landing/gallery",
            title: "Landing Gallery",
            description: "Bucket landing_page",
            icon: Images,
          },
          {
            href: "/admin-daz/catalog/products",
            title: "Product Images",
            description: "Bucket catalogs",
            icon: PackageSearch,
          },
        ]}
      />
    </div>
  )
}
