import { AdminResourceManager } from "@/components/admin-daz/admin-resource-manager"
import { faqsConfig } from "@/lib/admin-daz/resource-config"

export default function AdminFaqsPage() {
  return <AdminResourceManager config={faqsConfig} />
}
