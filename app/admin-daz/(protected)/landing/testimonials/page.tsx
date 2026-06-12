import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { testimonialsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminTestimonialsPage() {
  return <AdminResourceManager config={testimonialsConfig} />
}
