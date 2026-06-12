import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { packageTiersConfig } from "@/lib/admin-daz/resource-config"

export default function AdminPackagesPage() {
  return <AdminResourceManager config={packageTiersConfig} />
}
