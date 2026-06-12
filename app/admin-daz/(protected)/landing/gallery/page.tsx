import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { galleryItemsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminGalleryPage() {
  return <AdminResourceManager config={galleryItemsConfig} />
}
