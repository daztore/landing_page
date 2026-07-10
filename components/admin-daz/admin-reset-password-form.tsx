"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Loader2, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminBrowserClient } from "@/lib/admin-daz/supabase-browser"

interface AdminResetPasswordFormProps {
  canReset: boolean
  invalidMessage: string
}

function validatePassword(password: string, confirmation: string) {
  if (!password.trim()) {
    return "Password baru wajib diisi."
  }

  if (password.length < 8) {
    return "Password baru minimal 8 karakter."
  }

  if (password !== confirmation) {
    return "Konfirmasi password tidak sama."
  }

  return ""
}

export function AdminResetPasswordForm({
  canReset,
  invalidMessage,
}: AdminResetPasswordFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sessionInvalid, setSessionInvalid] = useState(false)

  const resetBlocked = !canReset || sessionInvalid

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationMessage = validatePassword(password, confirmation)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    setError("")

    const supabase = getAdminBrowserClient()

    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.")
      setLoading(false)
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setSessionInvalid(true)
      setError("")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(
        "Password belum dapat diperbarui. Pastikan link reset masih valid dan password memenuhi aturan.",
      )
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.replace("/admin-daz/login?reset=success")
    router.refresh()
  }

  if (resetBlocked) {
    return (
      <div className="space-y-5">
        <div
          aria-live="polite"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
        >
          {sessionInvalid
            ? "Sesi reset password sudah tidak tersedia atau sudah kedaluwarsa."
            : invalidMessage}
        </div>
        <Button asChild className="min-h-12 w-full">
          <Link href="/admin-daz/forgot-password">
            <RotateCcw />
            Minta link reset baru
          </Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-11 w-full">
          <Link href="/admin-daz/login">Kembali ke halaman login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold" htmlFor="admin-new-password">
            Password baru
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 transition-colors hover:text-amber-900"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
        <Input
          id="admin-new-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className="min-h-12"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="admin-confirm-password">
          Konfirmasi password baru
        </label>
        <Input
          id="admin-confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className="min-h-12"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </div>

      {error && (
        <div
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <Button type="submit" className="min-h-12 w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <RotateCcw />}
        {loading ? "Memperbarui password..." : "Perbarui password"}
      </Button>
    </form>
  )
}
