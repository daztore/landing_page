import { NextResponse, type NextRequest } from "next/server"

import {
  ADMIN_PASSWORD_RECOVERY_COOKIE,
  ADMIN_PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
  getSafeAdminRecoveryNext,
} from "@/lib/admin-daz/password-recovery"
import { createAdminServerClient } from "@/lib/admin-daz/supabase-server"

function redirectToForgotPassword(request: NextRequest) {
  const redirectUrl = new URL("/admin-daz/forgot-password", request.url)
  redirectUrl.searchParams.set("status", "recovery-error")

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(ADMIN_PASSWORD_RECOVERY_COOKIE, "", {
    maxAge: 0,
    path: "/admin-daz",
  })

  return response
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = getSafeAdminRecoveryNext(requestUrl.searchParams.get("next"))

  if (!code) {
    return redirectToForgotPassword(request)
  }

  const supabase = await createAdminServerClient()

  if (!supabase) {
    const redirectUrl = new URL("/admin-daz/login", request.url)
    redirectUrl.searchParams.set("error", "configuration")
    return NextResponse.redirect(redirectUrl)
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  const redirectType = (data as { redirectType?: string | null } | null)?.redirectType

  if (error || !data.session || redirectType !== "recovery") {
    return redirectToForgotPassword(request)
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url))
  response.cookies.set(ADMIN_PASSWORD_RECOVERY_COOKIE, "1", {
    httpOnly: true,
    maxAge: ADMIN_PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
    path: "/admin-daz",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
