import { createHash } from "node:crypto"

import { NextResponse } from "next/server"

import {
  ADMIN_PASSWORD_RECOVERY_DEFAULT_NEXT,
} from "@/lib/admin-daz/password-recovery"
import { createAdminServerClient } from "@/lib/admin-daz/supabase-server"
import {
  checkRateLimit,
  getRequestClientIp,
} from "@/lib/security/rate-limit"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const forgotPasswordRequestMaxBytes = 4 * 1024
const genericSuccessMessage =
  "Jika email tersebut terdaftar, link untuk mengatur ulang password akan dikirim."

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const noStoreHeaders = {
  "Cache-Control": "no-store",
}

function getJsonContentType(request: Request) {
  return request.headers
    .get("content-type")
    ?.toLowerCase()
    .startsWith("application/json")
}

function getContentLength(request: Request) {
  const value = request.headers.get("content-length")
  const parsed = value ? Number(value) : 0
  return Number.isFinite(parsed) ? parsed : 0
}

function getRecoveryCallbackUrl() {
  const callbackUrl = new URL("/admin-daz/auth/callback", getSiteUrl())
  callbackUrl.searchParams.set("next", ADMIN_PASSWORD_RECOVERY_DEFAULT_NEXT)
  return callbackUrl.toString()
}

function getEmailHash(email: string) {
  return createHash("sha256").update(email).digest("hex").slice(0, 32)
}

function successResponse() {
  return NextResponse.json(
    {
      ok: true,
      message: genericSuccessMessage,
    },
    {
      headers: noStoreHeaders,
    },
  )
}

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan reset password. Silakan coba lagi nanti." },
    {
      status: 429,
      headers: {
        ...noStoreHeaders,
        "Retry-After": String(retryAfterSeconds),
      },
    },
  )
}

function rateLimitUnavailableResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error:
        "Permintaan reset password sementara tidak dapat diproses. Silakan coba lagi nanti.",
    },
    {
      status: 503,
      headers: {
        ...noStoreHeaders,
        "Retry-After": String(retryAfterSeconds),
      },
    },
  )
}

export async function POST(request: Request) {
  if (!getJsonContentType(request)) {
    return NextResponse.json(
      { error: "Format request tidak valid." },
      { status: 415, headers: noStoreHeaders },
    )
  }

  if (getContentLength(request) > forgotPasswordRequestMaxBytes) {
    return NextResponse.json(
      { error: "Request terlalu besar." },
      { status: 413, headers: noStoreHeaders },
    )
  }

  const clientIp = getRequestClientIp(request)
  const ipRateLimit = await checkRateLimit({
    key: `admin-password-recovery-ip:${clientIp}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })

  if (!ipRateLimit.available) {
    return rateLimitUnavailableResponse(ipRateLimit.retryAfterSeconds)
  }

  if (!ipRateLimit.allowed) {
    return rateLimitResponse(ipRateLimit.retryAfterSeconds)
  }

  let bodyText = ""
  try {
    bodyText = await request.text()
  } catch {
    return NextResponse.json(
      { error: "Format request tidak valid." },
      { status: 400, headers: noStoreHeaders },
    )
  }

  if (Buffer.byteLength(bodyText, "utf8") > forgotPasswordRequestMaxBytes) {
    return NextResponse.json(
      { error: "Request terlalu besar." },
      { status: 413, headers: noStoreHeaders },
    )
  }

  let payload: unknown
  try {
    payload = JSON.parse(bodyText)
  } catch {
    return NextResponse.json(
      { error: "Format request tidak valid." },
      { status: 400, headers: noStoreHeaders },
    )
  }

  const email =
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : ""

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Email tidak valid." },
      { status: 400, headers: noStoreHeaders },
    )
  }

  const emailRateLimit = await checkRateLimit({
    key: `admin-password-recovery-email:${getEmailHash(email)}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  })

  if (!emailRateLimit.available) {
    return rateLimitUnavailableResponse(emailRateLimit.retryAfterSeconds)
  }

  if (!emailRateLimit.allowed) {
    return rateLimitResponse(emailRateLimit.retryAfterSeconds)
  }

  const supabase = await createAdminServerClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Konfigurasi Supabase belum tersedia." },
      { status: 503, headers: noStoreHeaders },
    )
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRecoveryCallbackUrl(),
  })

  if (error) {
    console.error(
      "[Admin Password Recovery] Supabase recovery request failed:",
      error.message,
    )
  }

  return successResponse()
}
