import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { updateAdminSession } from "@/lib/admin-daz/proxy"

const publicOrderSecurityHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
}

function applyPublicOrderSecurityHeaders(response: NextResponse) {
  for (const [name, value] of Object.entries(publicOrderSecurityHeaders)) {
    response.headers.set(name, value)
  }

  return response
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/order/")) {
    const isOrderDetailPath = /^\/order\/[^/]+\/?$/.test(
      request.nextUrl.pathname,
    )

    if (isOrderDetailPath && request.nextUrl.searchParams.has("token")) {
      const tokens = request.nextUrl.searchParams.getAll("token")

      if (tokens.length !== 1 || !tokens[0]) {
        return applyPublicOrderSecurityHeaders(
          new NextResponse("Link order tidak valid atau sudah tidak berlaku.", {
            status: 404,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
          }),
        )
      }

      const accessUrl = request.nextUrl.clone()
      accessUrl.pathname = `${request.nextUrl.pathname.replace(/\/$/, "")}/access`
      accessUrl.search = ""
      accessUrl.searchParams.set("token", tokens[0])

      return applyPublicOrderSecurityHeaders(
        NextResponse.redirect(accessUrl, { status: 303 }),
      )
    }

    return applyPublicOrderSecurityHeaders(NextResponse.next())
  }

  return updateAdminSession(request)
}

export const config = {
  matcher: ["/admin-daz/:path*", "/order/:path*"],
}
