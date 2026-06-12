import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { landingItemsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminLandingItemsPage() {
  return <AdminResourceManager config={landingItemsConfig} />
}
