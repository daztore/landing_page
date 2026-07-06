import { NextResponse } from "next/server"

import { handleAdminLeadAction } from "@/features/leads/server"
import { getAdminSession } from "@/lib/admin-daz/auth"

interface LeadActionContext {
  params: Promise<{ id: string }>
}

function adminSessionStatusCode(status: Awaited<ReturnType<typeof getAdminSession>>["status"]) {
  if (status === "unconfigured") {
    return 503
  }
  if (status === "anonymous") {
    return 401
  }
  return 403
}

export async function POST(request: Request, { params }: LeadActionContext) {
  const session = await getAdminSession()

  if (session.status !== "admin") {
    return NextResponse.json(
      { error: "Akses admin diperlukan." },
      { status: adminSessionStatusCode(session.status) },
    )
  }

  const { id } = await params

  try {
    const formData = await request.formData()
    await handleAdminLeadAction(session.client, session.admin.id, id, formData)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Aksi lead belum bisa diproses.",
      },
      { status: 400 },
    )
  }
}
