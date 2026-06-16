import { NextResponse } from "next/server"

import {
  createFeedbackRequest,
  listFeedbackRequests,
} from "@/lib/admin-daz/feedback-service"
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

export async function GET() {
  const session = await getAdminSession()

  if (session.status !== "admin") {
    return NextResponse.json(
      { error: "Akses admin diperlukan." },
      { status: adminSessionStatusCode(session.status) },
    )
  }

  try {
    const requests = await listFeedbackRequests(session.client)
    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memuat request feedback.",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession()

  if (session.status !== "admin") {
    return NextResponse.json(
      { error: "Akses admin diperlukan." },
      { status: adminSessionStatusCode(session.status) },
    )
  }

  try {
    const formData = await request.formData()
    const feedbackRequest = await createFeedbackRequest(
      session.client,
      session.admin.id,
      formData,
    )

    return NextResponse.json({ request: feedbackRequest }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat request feedback.",
      },
      { status: 400 },
    )
  }
}
