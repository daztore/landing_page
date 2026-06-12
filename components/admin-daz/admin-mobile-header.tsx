"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { getAdminBrowserClient } from "@/lib/admin-daz/supabase-browser"

export function AdminMobileHeader({ email }: { email: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    await getAdminBrowserClient()?.auth.signOut()
    router.replace("/admin-daz/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-amber-200/70 bg-[#fffaf0]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="min-w-0">
          <p className="font-serif text-lg font-bold text-stone-900">daztore admin</p>
          <p className="truncate text-xs text-stone-500">{email}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          disabled={loading}
          onClick={() => void logout()}
          aria-label="Keluar dari admin"
        >
          <LogOut />
        </Button>
      </div>
    </header>
  )
}
