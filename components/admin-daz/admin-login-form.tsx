"use client"

import { useState } from "react"
import { Loader2, LockKeyhole } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminBrowserClient } from "@/lib/admin-daz/supabase-browser"
import { isActiveAdmin } from "@/lib/admin-daz/permissions"

export function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(() => {
    if (searchParams.get("error") === "configuration") {
      return "Konfigurasi Supabase belum tersedia pada aplikasi."
    }
    return ""
  })

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const supabase = getAdminBrowserClient()
    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.")
      setLoading(false)
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || !data.user) {
      setError("Email atau password tidak valid.")
      setLoading(false)
      return
    }

    const admin = await isActiveAdmin(supabase, data.user.id)
    if (!admin) {
      await supabase.auth.signOut()
      setError("Akun ini tidak memiliki akses admin aktif.")
      setLoading(false)
      return
    }

    router.replace("/admin-daz/dashboard")
    router.refresh()
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="admin-email">
          Email
        </label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="admin-password">
          Password
        </label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <Button type="submit" className="min-h-12 w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />}
        {loading ? "Memeriksa akses..." : "Masuk ke Admin"}
      </Button>
    </form>
  )
}
