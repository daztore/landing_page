import { ArrowLeft, CalendarDays, MessageCircle, UserRound } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminCard } from "@/components/admin-daz/admin-card"
import { AdminLeadActions } from "@/features/leads/components/admin-lead-actions"
import {
  leadSourceLabels,
  leadStatusLabels,
  type AdminLeadDetail,
  type LeadProductSnapshot,
} from "@/features/leads"
import { getAdminLeadDetail } from "@/features/leads/server"
import { requireAdmin } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

interface AdminLeadDetailPageProps {
  params: Promise<{ id: string }>
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function getProductSnapshot(snapshot: AdminLeadDetail["productSnapshot"]) {
  return snapshot && "title" in snapshot ? (snapshot as LeadProductSnapshot) : null
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-stone-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-stone-800">{value || "-"}</p>
    </div>
  )
}

export default async function AdminLeadDetailPage({
  params,
}: AdminLeadDetailPageProps) {
  const { id } = await params
  const session = await requireAdmin()

  let lead: AdminLeadDetail | null = null
  try {
    lead = await getAdminLeadDetail(session.client, id)
  } catch (error) {
    return (
      <AdminCard>
        <Link
          href="/admin-daz/leads"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
        >
          <ArrowLeft className="size-4" />
          Leads
        </Link>
        <h1 className="mt-4 font-serif text-2xl font-bold">Lead belum bisa dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Pastikan migration lead sudah dijalankan.
        </p>
        <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-600">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </AdminCard>
    )
  }

  if (!lead) {
    notFound()
  }

  const snapshot = getProductSnapshot(lead.productSnapshot)

  return (
    <div className="space-y-5">
      <Link
        href="/admin-daz/leads"
        className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
      >
        <ArrowLeft className="size-4" />
        Leads
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <AdminCard>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  {leadStatusLabels[lead.status]}
                </span>
                <h1 className="mt-3 font-serif text-2xl font-bold">{lead.customerName}</h1>
                <p className="mt-1 text-sm text-stone-600">
                  {leadSourceLabels[lead.source]} - {dateFormatter.format(new Date(lead.createdAt))}
                </p>
              </div>
              <a
                href={`https://wa.me/${lead.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailItem label="WhatsApp" value={lead.whatsappNumber} />
              <DetailItem label="Email" value={lead.email} />
              <DetailItem label="Tanggal acara" value={lead.eventDate ?? ""} />
              <DetailItem label="Budget" value={lead.budgetRange} />
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-start gap-3">
              <UserRound className="mt-1 size-5 shrink-0 text-amber-700" />
              <div className="min-w-0">
                <h2 className="font-serif text-xl font-semibold">Minat produk</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {snapshot?.title || lead.interestCategory || "Belum ada produk spesifik."}
                </p>
                {snapshot && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <DetailItem label="Kategori" value={snapshot.category.name} />
                    <DetailItem label="Estimasi" value={snapshot.price.label} />
                    <DetailItem label="Slug" value={snapshot.slug} />
                    <DetailItem label="Pengerjaan" value={snapshot.processingTime ?? ""} />
                  </div>
                )}
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="font-serif text-xl font-semibold">Catatan customer</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
              {lead.message || "-"}
            </p>
          </AdminCard>

          <AdminCard>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 size-5 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-semibold">Timeline follow-up</h2>
                <div className="mt-4 space-y-3">
                  {lead.messages.length === 0 ? (
                    <p className="text-sm text-stone-600">Belum ada pesan atau catatan.</p>
                  ) : (
                    lead.messages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span>{dateFormatter.format(new Date(message.createdAt))}</span>
                          <span>-</span>
                          <span>{message.messageType}</span>
                          {message.statusTo && (
                            <>
                              <span>-</span>
                              <span>{leadStatusLabels[message.statusTo]}</span>
                            </>
                          )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                          {message.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <AdminLeadActions leadId={lead.id} currentStatus={lead.status} />
      </div>
    </div>
  )
}
