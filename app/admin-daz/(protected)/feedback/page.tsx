import { AdminFeedbackManager } from "@/components/admin-daz/admin-feedback-manager"
import { listFeedbackRequests } from "@/lib/admin-daz/feedback-service"
import { requireAdmin } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

export default async function AdminFeedbackPage() {
  const session = await requireAdmin()
  const requests = await listFeedbackRequests(session.client)

  return <AdminFeedbackManager initialRequests={requests} />
}
