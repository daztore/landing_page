import type { Metadata } from "next"
import { cookies } from "next/headers"

import { AdminResetPasswordForm } from "@/components/admin-daz/admin-reset-password-form"
import { ADMIN_PASSWORD_RECOVERY_COOKIE } from "@/lib/admin-daz/password-recovery"
import { createAdminServerClient } from "@/lib/admin-daz/supabase-server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Reset Password Admin | daztore.id",
}

export default async function AdminResetPasswordPage() {
  const cookieStore = await cookies()
  const hasRecoveryCookie = cookieStore.get(ADMIN_PASSWORD_RECOVERY_COOKIE)?.value === "1"
  const supabase = await createAdminServerClient()

  let hasValidSession = false

  if (supabase && hasRecoveryCookie) {
    const { data, error } = await supabase.auth.getUser()
    hasValidSession = !error && Boolean(data.user)
  }

  const canReset = Boolean(supabase && hasRecoveryCookie && hasValidSession)
  const invalidMessage = !supabase
    ? "Konfigurasi Supabase belum tersedia pada aplikasi."
    : "Link reset password tidak valid, sudah kedaluwarsa, atau belum dibuka dari email recovery."

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          daztore.id
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">
          Reset password
        </h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-stone-600">
          Buat password admin baru. Link reset hanya dapat digunakan setelah sesi recovery
          dari email Supabase berhasil dibuat.
        </p>
        <AdminResetPasswordForm canReset={canReset} invalidMessage={invalidMessage} />
      </div>
    </main>
  )
}
