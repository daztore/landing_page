import { Suspense } from "react"
import { redirect } from "next/navigation"

import { AdminLoginForm } from "@/components/admin-daz/admin-login-form"
import { getAdminSession } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const session = await getAdminSession()

  if (session.status === "admin") {
    redirect("/admin-daz/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          daztore.id
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">
          Admin Login
        </h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-stone-600">
          Masuk dengan akun Supabase Auth yang terdaftar sebagai admin aktif.
        </p>
        <Suspense fallback={<p className="text-sm text-stone-500">Memuat form...</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  )
}
