import type { Metadata } from "next"

import { AdminForgotPasswordForm } from "@/components/admin-daz/admin-forgot-password-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Lupa Password Admin | daztore.id",
}

interface AdminForgotPasswordPageProps {
  searchParams?: Promise<{
    status?: string
  }>
}

export default async function AdminForgotPasswordPage({
  searchParams,
}: AdminForgotPasswordPageProps) {
  const params = searchParams ? await searchParams : {}
  const initialError =
    params.status === "recovery-error"
      ? "Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru."
      : ""

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          daztore.id
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">
          Lupa password
        </h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-stone-600">
          Masukkan email admin. Jika email terdaftar, link untuk mengatur ulang password
          akan dikirim melalui Supabase Auth.
        </p>
        <AdminForgotPasswordForm initialError={initialError} />
      </div>
    </main>
  )
}
