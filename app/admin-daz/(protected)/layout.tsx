import { AdminShell } from "@/components/admin-daz/admin-shell"
import { requireAdmin } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return <AdminShell email={session.admin.email}>{children}</AdminShell>
}
