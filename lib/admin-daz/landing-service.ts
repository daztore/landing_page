import type {
  AdminResourceConfig,
  AdminRow,
  AdminTableName,
} from "@/lib/admin-daz/types"
import { getAdminBrowserClient } from "@/lib/admin-daz/supabase-browser"

function requireClient() {
  const client = getAdminBrowserClient()
  if (!client) {
    throw new Error("Konfigurasi Supabase belum tersedia.")
  }
  return client
}

export async function listAdminRows(config: AdminResourceConfig) {
  const client = requireClient()
  let query = client.from(config.table).select("*")

  if (config.orderColumn) {
    query = query.order(config.orderColumn, { ascending: true })
  }

  const { data, error } = await query
  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as AdminRow[]
}

export async function listRelationOptions(
  table: AdminTableName,
  valueColumn: string,
  labelColumn: string,
  orderColumn = labelColumn,
) {
  const client = requireClient()
  const { data, error } = await client
    .from(table)
    .select(`${valueColumn},${labelColumn}`)
    .order(orderColumn, { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => {
    const relationRow = row as unknown as AdminRow
    return {
      value: String(relationRow[valueColumn]),
      label: String(relationRow[labelColumn]),
    }
  })
}

export async function saveAdminRow(
  config: AdminResourceConfig,
  payload: AdminRow,
  originalPrimaryValue?: unknown,
) {
  const client = requireClient()

  const result =
    originalPrimaryValue === undefined
      ? await client.from(config.table).insert(payload).select().single()
      : await client
          .from(config.table)
          .update(payload)
          .eq(config.primaryKey, originalPrimaryValue)
          .select()
          .single()

  if (result.error) {
    throw new Error(result.error.message)
  }
  return result.data as AdminRow
}

export async function setAdminRowActive(
  config: AdminResourceConfig,
  primaryValue: unknown,
  isActive: boolean,
) {
  const client = requireClient()
  const { error } = await client
    .from(config.table)
    .update({ is_active: isActive })
    .eq(config.primaryKey, primaryValue)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteAdminRow(
  config: AdminResourceConfig,
  primaryValue: unknown,
) {
  const client = requireClient()
  const { error } = await client
    .from(config.table)
    .delete()
    .eq(config.primaryKey, primaryValue)

  if (error) {
    throw new Error(error.message)
  }
}
