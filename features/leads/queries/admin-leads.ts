import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import {
  leadStatuses,
  type AdminLeadDetail,
  type AdminLeadListItem,
  type AdminLeadMessage,
  type LeadProductSnapshot,
  type LeadSource,
  type LeadStatus,
} from "@/features/leads/types"

export const leadUuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface LeadRow {
  id: string
  source: LeadSource
  status: LeadStatus
  customer_name: string
  whatsapp_number: string
  email: string | null
  product_slug: string | null
  product_snapshot: LeadProductSnapshot | Record<string, never> | null
  interest_category: string | null
  event_date: string | null
  budget_range: string | null
  message: string | null
  consent_accepted: boolean
  consent_text: string
  metadata: Record<string, unknown> | null
  created_at: string
  last_contacted_at: string | null
}

interface LeadMessageRow {
  id: string
  message_type: AdminLeadMessage["messageType"]
  channel: AdminLeadMessage["channel"]
  body: string
  status_from: LeadStatus | null
  status_to: LeadStatus | null
  created_by: string | null
  created_at: string
}

export interface ListAdminLeadsOptions {
  status?: LeadStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface ListAdminLeadsResult {
  leads: AdminLeadListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function isLeadStatus(value: string | null | undefined): value is LeadStatus {
  return Boolean(value && (leadStatuses as readonly string[]).includes(value))
}

function getSnapshotTitle(snapshot: LeadRow["product_snapshot"]) {
  return snapshot && "title" in snapshot && typeof snapshot.title === "string"
    ? snapshot.title
    : ""
}

function mapLeadListItem(row: LeadRow): AdminLeadListItem {
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    customerName: row.customer_name,
    whatsappNumber: row.whatsapp_number,
    productSlug: row.product_slug,
    productTitle: getSnapshotTitle(row.product_snapshot),
    interestCategory: row.interest_category ?? "",
    createdAt: row.created_at,
    lastContactedAt: row.last_contacted_at,
  }
}

function mapLeadDetail(row: LeadRow, messages: LeadMessageRow[]): AdminLeadDetail {
  return {
    ...mapLeadListItem(row),
    email: row.email ?? "",
    eventDate: row.event_date,
    budgetRange: row.budget_range ?? "",
    message: row.message ?? "",
    productSnapshot: row.product_snapshot ?? {},
    consentAccepted: row.consent_accepted,
    consentText: row.consent_text,
    metadata: row.metadata ?? {},
    messages: messages.map((message) => ({
      id: message.id,
      messageType: message.message_type,
      channel: message.channel,
      body: message.body,
      statusFrom: message.status_from,
      statusTo: message.status_to,
      createdBy: message.created_by,
      createdAt: message.created_at,
    })),
  }
}

function sanitizeSearch(value: string) {
  return value.replace(/[%_,]/g, " ").trim().slice(0, 80)
}

export async function listAdminLeads(
  client: SupabaseClient,
  options: ListAdminLeadsOptions = {},
): Promise<ListAdminLeadsResult> {
  const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 50)
  const page = Math.max(options.page ?? 1, 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from("leads")
    .select(
      "id,source,status,customer_name,whatsapp_number,email,product_slug,product_snapshot,interest_category,event_date,budget_range,message,consent_accepted,consent_text,metadata,created_at,last_contacted_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (options.status) {
    query = query.eq("status", options.status)
  }

  const search = sanitizeSearch(options.search ?? "")
  if (search) {
    query = query.or(
      [
        `customer_name.ilike.%${search}%`,
        `whatsapp_number.ilike.%${search}%`,
        `product_slug.ilike.%${search}%`,
        `interest_category.ilike.%${search}%`,
      ].join(","),
    )
  }

  const { data, error, count } = await query
  if (error) {
    throw new Error(error.message)
  }

  const total = count ?? 0

  return {
    leads: ((data ?? []) as LeadRow[]).map(mapLeadListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getAdminLeadDetail(
  client: SupabaseClient,
  leadId: string,
): Promise<AdminLeadDetail | null> {
  if (!leadUuidPattern.test(leadId)) {
    return null
  }

  const { data: leadData, error: leadError } = await client
    .from("leads")
    .select(
      "id,source,status,customer_name,whatsapp_number,email,product_slug,product_snapshot,interest_category,event_date,budget_range,message,consent_accepted,consent_text,metadata,created_at,last_contacted_at",
    )
    .eq("id", leadId)
    .maybeSingle()

  if (leadError) {
    throw new Error(leadError.message)
  }

  if (!leadData) {
    return null
  }

  const { data: messageData, error: messageError } = await client
    .from("lead_messages")
    .select("id,message_type,channel,body,status_from,status_to,created_by,created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true })

  if (messageError) {
    throw new Error(messageError.message)
  }

  return mapLeadDetail(leadData as LeadRow, (messageData ?? []) as LeadMessageRow[])
}
