import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { productCategoriesConfig } from "@/lib/admin-daz/resource-config"

export default function AdminCategoriesPage() {
  return <AdminResourceManager config={productCategoriesConfig} />
}
