import { NextResponse } from "next/server"

import { createAdminOrder } from "@/features/orders/server"
import {
  adminOrderRequestMaxBytes,
  parseCreateOrderRequestBody,
} from "@/features/orders/validation/order-request"
import { getAdminSession } from "@/lib/admin-daz/auth"

function adminSessionStatusCode(status: Awaited<ReturnType<typeof getAdminSession>>["status"]) {
  if (status === "unconfigured") {
    return 503
  }
  if (status === "anonymous") {
    return 401
  }
  return 403
}

function hasJsonContentType(request: Request) {
  return request.headers.get("content-type")?.toLowerCase().includes("application/json")
}

function getContentLength(request: Request) {
  const value = request.headers.get("content-length")
  return value ? Number(value) : 0
}

export async function POST(request: Request) {
  const session = await getAdminSession()

  if (session.status !== "admin") {
    return NextResponse.json(
      { error: "Akses admin diperlukan." },
      { status: adminSessionStatusCode(session.status) },
    )
  }

  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: "Content-Type harus application/json." }, { status: 415 })
  }

  if (getContentLength(request) > adminOrderRequestMaxBytes) {
    return NextResponse.json({ error: "Payload order terlalu besar." }, { status: 413 })
  }

  try {
    const body = (await request.json()) as unknown
    const input = parseCreateOrderRequestBody(body)
    const order = await createAdminOrder(session.client, session.admin.id, input)

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          publicUrl: order.publicUrl,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Order belum bisa dibuat.",
      },
      { status: 400 },
    )
  }
}
