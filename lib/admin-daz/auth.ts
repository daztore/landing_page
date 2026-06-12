import { redirect } from "next/navigation"

import { isActiveAdmin } from "@/lib/admin-daz/permissions"
import { createAdminServerClient } from "@/lib/admin-daz/supabase-server"

export async function getAdminSession() {
  const supabase = await createAdminServerClient()

  if (!supabase) {
    return { status: "unconfigured" as const }
  }

  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims.sub

  if (error || !userId) {
    return { status: "anonymous" as const }
  }

  const admin = await isActiveAdmin(supabase, userId)

  if (!admin) {
    return { status: "forbidden" as const }
  }

  return {
    status: "admin" as const,
    admin,
    client: supabase,
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()

  if (session.status === "unconfigured") {
    redirect("/admin-daz/login?error=configuration")
  }

  if (session.status === "anonymous") {
    redirect("/admin-daz/login")
  }

  if (session.status === "forbidden") {
    redirect("/admin-daz/unauthorized")
  }

  return session
}
