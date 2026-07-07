import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { leadStatuses, type LeadStatus } from "@/features/leads/types"
import { leadUuidPattern } from "@/features/leads/queries/admin-leads"

function getText(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength)
}

function isLeadStatus(value: string): value is LeadStatus {
  return (leadStatuses as readonly string[]).includes(value)
}

export async function addAdminLeadNote(
  client: SupabaseClient,
  adminId: string,
  leadId: string,
  body: string,
) {
  const note = body.trim().slice(0, 4000)

  if (!leadUuidPattern.test(leadId)) {
    throw new Error("Lead tidak valid.")
  }

  if (!note) {
    throw new Error("Catatan follow-up wajib diisi.")
  }

  const { error } = await client.from("lead_messages").insert({
    lead_id: leadId,
    message_type: "admin_note",
    channel: "admin",
    body: note,
    status_from: null,
    status_to: null,
    created_by: adminId,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateAdminLeadStatus(
  client: SupabaseClient,
  leadId: string,
  status: string,
  note?: string,
) {
  if (!leadUuidPattern.test(leadId)) {
    throw new Error("Lead tidak valid.")
  }

  if (!isLeadStatus(status)) {
    throw new Error("Status lead tidak valid.")
  }

  const { error } = await client.rpc("change_lead_status", {
    p_lead_id: leadId,
    p_status: status,
    p_note: note?.trim() || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function handleAdminLeadAction(
  client: SupabaseClient,
  adminId: string,
  leadId: string,
  formData: FormData,
) {
  const action = getText(formData, "action", 40)

  if (action === "add_note") {
    await addAdminLeadNote(client, adminId, leadId, getText(formData, "note", 4000))
    return
  }

  if (action === "update_status") {
    await updateAdminLeadStatus(
      client,
      leadId,
      getText(formData, "status", 40),
      getText(formData, "note", 4000),
    )
    return
  }

  throw new Error("Aksi lead tidak valid.")
}
