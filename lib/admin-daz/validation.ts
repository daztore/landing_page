import type {
  AdminFieldConfig,
  AdminResourceConfig,
  AdminRow,
} from "@/lib/admin-daz/types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function parseFieldValue(field: AdminFieldConfig, value: unknown) {
  if (field.type === "checkbox") {
    return Boolean(value)
  }

  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) {
      return field.nullable ? null : 0
    }

    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      throw new Error(`${field.label} harus berupa angka.`)
    }
    if (field.min !== undefined && parsed < field.min) {
      throw new Error(`${field.label} minimal ${field.min}.`)
    }
    if (field.max !== undefined && parsed > field.max) {
      throw new Error(`${field.label} maksimal ${field.max}.`)
    }
    return parsed
  }

  if (field.type === "json") {
    if (!value || value === "") {
      return {}
    }
    if (typeof value !== "string") {
      return value
    }

    try {
      const parsed = JSON.parse(value)
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        throw new Error()
      }
      return parsed
    } catch {
      throw new Error(`${field.label} harus berupa JSON object yang valid.`)
    }
  }

  if (field.type === "lines") {
    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean)
    }
    return String(value ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const parsed = String(value ?? "").trim()
  if (!parsed && field.nullable) {
    return null
  }
  return parsed
}

export function prepareAdminPayload(
  config: AdminResourceConfig,
  values: AdminRow,
) {
  const payload: AdminRow = {}

  for (const field of config.fields) {
    const rawValue = values[field.name]

    if (
      field.required &&
      field.type !== "checkbox" &&
      (rawValue === null || rawValue === undefined || String(rawValue).trim() === "")
    ) {
      throw new Error(`${field.label} wajib diisi.`)
    }

    const parsed = parseFieldValue(field, rawValue)

    if (
      (field.name === "slug" || field.name === "key") &&
      typeof parsed === "string" &&
      !slugPattern.test(parsed)
    ) {
      throw new Error(`${field.label} hanya boleh berisi huruf kecil, angka, dan tanda hubung.`)
    }

    payload[field.name] = parsed
  }

  if (config.table === "products") {
    const startPrice = Number(payload.start_price)
    const endPrice = payload.end_price === null ? null : Number(payload.end_price)

    if (endPrice !== null && endPrice < startPrice) {
      throw new Error("Harga akhir tidak boleh lebih kecil dari harga awal.")
    }
  }

  return payload
}

export function formatAdminFieldValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-"
  }
  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak"
  }
  if (Array.isArray(value)) {
    return value.join(", ")
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}
