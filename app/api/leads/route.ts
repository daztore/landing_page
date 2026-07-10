import { NextResponse } from "next/server"

import { createPublicLead } from "@/features/leads/server"
import {
  leadRequestMaxBytes,
  parseCreateLeadRequestBody,
} from "@/features/leads/validation/lead-request"
import {
  checkRateLimit,
  getRequestClientIp,
} from "@/lib/security/rate-limit"

function getContentLength(request: Request) {
  const value = request.headers.get("content-length")
  const parsed = value ? Number(value) : 0
  return Number.isFinite(parsed) ? parsed : 0
}

function getJsonContentType(request: Request) {
  return request.headers.get("content-type")?.toLowerCase().startsWith("application/json")
}

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Terlalu banyak inquiry. Silakan coba lagi nanti." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  )
}

function rateLimitUnavailableResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Inquiry sementara tidak dapat diproses. Silakan coba lagi nanti." },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  )
}

export async function POST(request: Request) {
  if (!getJsonContentType(request)) {
    return NextResponse.json(
      { error: "Format request tidak valid." },
      { status: 415 },
    )
  }

  if (getContentLength(request) > leadRequestMaxBytes) {
    return NextResponse.json(
      { error: "Inquiry terlalu besar." },
      { status: 413 },
    )
  }

  const clientIp = getRequestClientIp(request)
  const ipRateLimit = await checkRateLimit({
    key: `lead-submit:${clientIp}`,
    limit: 8,
    windowMs: 60 * 60 * 1000,
  })

  if (!ipRateLimit.available) {
    return rateLimitUnavailableResponse(ipRateLimit.retryAfterSeconds)
  }

  if (!ipRateLimit.allowed) {
    return rateLimitResponse(ipRateLimit.retryAfterSeconds)
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Format inquiry tidak valid." },
      { status: 400 },
    )
  }

  const parsed = parseCreateLeadRequestBody(payload)
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.message },
      { status: parsed.status ?? 400 },
    )
  }

  const phoneRateLimit = await checkRateLimit({
    key: `lead-submit-phone:${parsed.input.whatsappNumber}`,
    limit: 4,
    windowMs: 60 * 60 * 1000,
  })

  if (!phoneRateLimit.available) {
    return rateLimitUnavailableResponse(phoneRateLimit.retryAfterSeconds)
  }

  if (!phoneRateLimit.allowed) {
    return rateLimitResponse(phoneRateLimit.retryAfterSeconds)
  }

  const userAgent = request.headers.get("user-agent")?.trim().slice(0, 200)
  const result = await createPublicLead({
    ...parsed.input,
    metadata: {
      ...parsed.input.metadata,
      userAgent: userAgent || undefined,
    },
  })

  if (result.status === "unconfigured") {
    return NextResponse.json(
      { error: "Inquiry belum bisa diterima. Silakan hubungi kami via WhatsApp." },
      { status: 503 },
    )
  }

  if (result.status === "invalid") {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Inquiry berhasil diterima. Tim daztore.id akan menghubungi Anda.",
    },
    { status: 201 },
  )
}
