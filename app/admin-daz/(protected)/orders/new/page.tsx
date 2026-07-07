import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { AdminCard } from "@/components/admin-daz/admin-card"
import { listCatalogProductsForOrder } from "@/features/catalog/server"
import { getAdminLeadDetail } from "@/features/leads/server"
import type { LeadProductSnapshot } from "@/features/leads"
import { AdminOrderForm } from "@/features/orders/components/admin-order-form"
import { uuidPattern } from "@/features/orders/validation/order-request"
import { requireAdmin } from "@/lib/admin-daz/auth"

export const dynamic = "force-dynamic"

interface AdminNewOrderPageProps {
  searchParams: Promise<{
    leadId?: string
  }>
}

function getProductSnapshot(snapshot: unknown) {
  return snapshot && typeof snapshot === "object" && "title" in snapshot
    ? (snapshot as LeadProductSnapshot)
    : null
}

export default async function AdminNewOrderPage({
  searchParams,
}: AdminNewOrderPageProps) {
  const session = await requireAdmin()
  const params = await searchParams
  const leadId = String(params.leadId ?? "")

  let products: Awaited<ReturnType<typeof listCatalogProductsForOrder>> = []
  try {
    products = await listCatalogProductsForOrder(session.client)
  } catch (error) {
    return (
      <AdminCard>
        <Link
          href="/admin-daz/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
        >
          <ArrowLeft className="size-4" />
          Orders
        </Link>
        <h1 className="mt-4 font-serif text-2xl font-bold">Form order belum bisa dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Data produk katalog belum bisa dimuat.
        </p>
        <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-600">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </AdminCard>
    )
  }

  const lead = uuidPattern.test(leadId)
    ? await getAdminLeadDetail(session.client, leadId)
    : null
  const snapshot = getProductSnapshot(lead?.productSnapshot)

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin-daz/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-800"
        >
          <ArrowLeft className="size-4" />
          Orders
        </Link>
        <h1 className="mt-3 font-serif text-2xl font-bold">Buat order manual</h1>
        <p className="mt-1 text-sm text-stone-600">
          Order baru selalu dimulai sebagai draft.
        </p>
      </div>

      <AdminOrderForm
        products={products}
        initialLead={
          lead
            ? {
                id: lead.id,
                customerName: lead.customerName,
                whatsappNumber: lead.whatsappNumber,
                email: lead.email,
                eventDate: lead.eventDate,
                productSlug: lead.productSlug,
                productTitle: snapshot?.title ?? lead.interestCategory,
                message: lead.message,
              }
            : undefined
        }
      />
    </div>
  )
}
