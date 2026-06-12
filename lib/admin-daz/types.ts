import type { StorageBucket } from "@/lib/supabase/storage"

export type AdminTableName =
  | "site_settings"
  | "landing_sections"
  | "landing_items"
  | "navigation_items"
  | "gallery_items"
  | "testimonials"
  | "faqs"
  | "product_categories"
  | "products"
  | "package_tiers"

export type AdminRow = Record<string, unknown>

export interface AdminFieldOption {
  label: string
  value: string
}

export interface AdminFieldRelation {
  table: AdminTableName
  valueColumn: string
  labelColumn: string
  orderColumn?: string
}

export type AdminFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "json"
  | "lines"
  | "image"

export interface AdminFieldConfig {
  name: string
  label: string
  type: AdminFieldType
  required?: boolean
  nullable?: boolean
  placeholder?: string
  helpText?: string
  min?: number
  max?: number
  options?: AdminFieldOption[]
  relation?: AdminFieldRelation
  bucket?: StorageBucket
  folder?: string
  defaultValue?: unknown
}

export interface AdminResourceConfig {
  table: AdminTableName
  title: string
  singular: string
  description: string
  primaryKey: string
  orderColumn?: string
  searchFields?: string[]
  filterField?: string
  fields: AdminFieldConfig[]
  previewFields: string[]
}
