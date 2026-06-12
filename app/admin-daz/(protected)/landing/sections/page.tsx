import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { landingSectionsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminLandingSectionsPage() {
  return <AdminResourceManager config={landingSectionsConfig} />
}
