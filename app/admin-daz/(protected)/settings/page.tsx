import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { siteSettingsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminSettingsPage() {
  return <AdminResourceManager config={siteSettingsConfig} />
}
