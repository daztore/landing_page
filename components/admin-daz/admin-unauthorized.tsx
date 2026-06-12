"use client"

import { LogOut, ShieldX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { getAdminBrowserClient } from "@/lib/admin-daz/supabase-browser"

export function AdminUnauthorized() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    await getAdminBrowserClient()?.auth.signOut()
    router.replace("/admin-daz/login")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-4">
      <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 text-center shadow-xl">
        <ShieldX className="mx-auto size-12 text-red-600" />
        <h1 className="mt-4 font-serif text-2xl font-bold">Akses ditolak</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Akun terautentikasi, tetapi tidak terdaftar sebagai admin aktif.
        </p>
        <Button
          className="mt-6 min-h-12 w-full"
          variant="outline"
          disabled={loading}
          onClick={() => void logout()}
        >
          <LogOut />
          Keluar dan gunakan akun lain
        </Button>
      </div>
    </main>
  )
}
