import { NextResponse } from "next/server"

import {
  buildPublicOrderCleanPath,
  exchangePublicOrderAccessToken,
  issuePublicOrderAccessCookie,
  publicOrderAccessRedirectStatus,
} from "@/features/orders/server"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const publicOrderSecurityHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
}

interface PublicOrderAccessRouteContext {
  params: Promise<{ orderNumber: string }>
}

function applySecurityHeaders(response: NextResponse) {
  for (const [name, value] of Object.entries(publicOrderSecurityHeaders)) {
    response.headers.set(name, value)
  }

  return response
}

function accessDeniedResponse() {
  return applySecurityHeaders(
    new NextResponse("Link order tidak valid atau sudah tidak berlaku.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }),
  )
}

export async function GET(
  request: Request,
  { params }: PublicOrderAccessRouteContext,
) {
  const { orderNumber } = await params
  const requestUrl = new URL(request.url)
  const tokens = requestUrl.searchParams.getAll("token")

  if (tokens.length !== 1) {
    return accessDeniedResponse()
  }

  try {
    const access = await exchangePublicOrderAccessToken(orderNumber, tokens[0])

    if (!access) {
      return accessDeniedResponse()
    }

    const cookie = issuePublicOrderAccessCookie(
      access.orderNumber,
      access.publicAccessTokenHash,
    )

    if (!cookie) {
      return accessDeniedResponse()
    }

    const cleanUrl = new URL(
      buildPublicOrderCleanPath(access.orderNumber),
      getSiteUrl(),
    )
    const response = applySecurityHeaders(
      NextResponse.redirect(cleanUrl, {
        status: publicOrderAccessRedirectStatus,
      }),
    )

    response.cookies.set(cookie.name, cookie.value, cookie.options)

    return response
  } catch {
    return accessDeniedResponse()
  }
}
