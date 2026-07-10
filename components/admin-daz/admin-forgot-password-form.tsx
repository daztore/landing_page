"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { ArrowLeft, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AdminForgotPasswordFormProps {
  initialError?: string
}

const genericSuccessMessage =
  "Jika email tersebut terdaftar, link untuk mengatur ulang password akan dikirim."
const genericFailureMessage =
  "Permintaan reset password belum dapat diproses. Coba lagi beberapa saat lagi."
const rateLimitMessage =
  "Terlalu banyak permintaan reset password. Silakan coba lagi nanti."

export function AdminForgotPasswordForm({
  initialError = "",
}: AdminForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const [success, setSuccess] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError("Email wajib diisi.")
      setSuccess("")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/admin-daz/forgot-password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (response.status === 429) {
        setError(rateLimitMessage)
        return
      }

      if (!response.ok) {
        setError(genericFailureMessage)
        return
      }

      setSuccess(genericSuccessMessage)
    } catch {
      setError(genericFailureMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="admin-reset-email">
          Email admin
        </label>
        <Input
          id="admin-reset-email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div aria-live="polite" className="space-y-3">
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      <Button type="submit" className="min-h-12 w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Mail />}
        {loading ? "Mengirim link..." : "Kirim link reset password"}
      </Button>

      <Button asChild variant="ghost" className="min-h-11 w-full">
        <Link href="/admin-daz/login">
          <ArrowLeft />
          Kembali ke halaman login
        </Link>
      </Button>
    </form>
  )
}
