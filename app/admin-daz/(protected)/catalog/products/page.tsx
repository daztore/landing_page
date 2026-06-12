import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { productsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminProductsPage() {
  return <AdminResourceManager config={productsConfig} />
}
