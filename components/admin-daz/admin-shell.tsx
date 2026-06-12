import { AdminBottomNav } from "@/components/admin-daz/admin-bottom-nav"
import { AdminMobileHeader } from "@/components/admin-daz/admin-mobile-header"

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-stone-900">
      <AdminMobileHeader email={email} />
      <div className="mx-auto grid max-w-6xl md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <AdminBottomNav />
        </aside>
        <main className="min-w-0 px-4 py-5 pb-28 md:px-6 md:pb-8">{children}</main>
      </div>
      <div className="md:hidden">
        <AdminBottomNav />
      </div>
    </div>
  )
}
