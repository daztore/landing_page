import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { navigationItemsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminNavigationPage() {
  return <AdminResourceManager config={navigationItemsConfig} />
}
