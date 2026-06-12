"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"

import { AdminCard } from "@/components/admin-daz/admin-card"
import { AdminConfirmDialog } from "@/components/admin-daz/admin-confirm-dialog"
import { AdminEmptyState } from "@/components/admin-daz/admin-empty-state"
import { AdminFormField } from "@/components/admin-daz/admin-form-field"
import { AdminImagePreview } from "@/components/admin-daz/admin-image-preview"
import { AdminImageUploader } from "@/components/admin-daz/admin-image-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteAdminRow,
  listAdminRows,
  listRelationOptions,
  saveAdminRow,
  setAdminRowActive,
} from "@/lib/admin-daz/landing-service"
import type {
  AdminFieldConfig,
  AdminFieldOption,
  AdminResourceConfig,
  AdminRow,
} from "@/lib/admin-daz/types"
import {
  formatAdminFieldValue,
  normalizeSlug,
  prepareAdminPayload,
} from "@/lib/admin-daz/validation"

function createInitialValues(config: AdminResourceConfig) {
  return Object.fromEntries(
    config.fields.map((field) => [
      field.name,
      field.defaultValue ?? (field.type === "checkbox" ? false : ""),
    ]),
  )
}

function createEditValues(config: AdminResourceConfig, row: AdminRow) {
  return Object.fromEntries(
    config.fields.map((field) => {
      const value = row[field.name] ?? field.defaultValue ?? ""

      if (field.type === "json") {
        return [field.name, JSON.stringify(value || {}, null, 2)]
      }
      if (field.type === "lines") {
        return [field.name, Array.isArray(value) ? value.join("\n") : String(value)]
      }
      return [field.name, value]
    }),
  )
}

function fieldOptions(
  field: AdminFieldConfig | undefined,
  relationOptions: Record<string, AdminFieldOption[]>,
) {
  if (!field) {
    return []
  }
  return field.options ?? relationOptions[field.name] ?? []
}

export function AdminResourceManager({
  config,
}: {
  config: AdminResourceConfig
}) {
  const [rows, setRows] = useState<AdminRow[]>([])
  const [relations, setRelations] = useState<Record<string, AdminFieldOption[]>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<AdminRow | null>(null)
  const [values, setValues] = useState<AdminRow>(() => createInitialValues(config))

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const relationFields = config.fields.filter((field) => field.relation)
      const [nextRows, relationEntries] = await Promise.all([
        listAdminRows(config),
        Promise.all(
          relationFields.map(async (field) => {
            const relation = field.relation!
            const options = await listRelationOptions(
              relation.table,
              relation.valueColumn,
              relation.labelColumn,
              relation.orderColumn,
            )
            return [field.name, options] as const
          }),
        ),
      ])
      setRows(nextRows)
      setRelations(Object.fromEntries(relationEntries))
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Gagal memuat data admin.",
      )
    } finally {
      setLoading(false)
    }
  }, [config])

  useEffect(() => {
    void load()
  }, [load])

  const filterConfig = config.fields.find(
    (field) => field.name === config.filterField,
  )

  const filterOptions = useMemo(() => {
    const configured = fieldOptions(filterConfig, relations)
    if (configured.length > 0) {
      return configured
    }

    if (!config.filterField) {
      return []
    }

    return Array.from(
      new Set(rows.map((row) => String(row[config.filterField!] ?? "")).filter(Boolean)),
    ).map((value) => ({ value, label: value }))
  }, [config.filterField, filterConfig, relations, rows])

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (
        filter &&
        config.filterField &&
        String(row[config.filterField] ?? "") !== filter
      ) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return (config.searchFields ?? config.previewFields).some((field) =>
        formatAdminFieldValue(row[field]).toLowerCase().includes(normalizedSearch),
      )
    })
  }, [config.filterField, config.previewFields, config.searchFields, filter, rows, search])

  function openCreate() {
    setEditingRow(null)
    setValues(createInitialValues(config))
    setError("")
    setNotice("")
    setEditorOpen(true)
  }

  function openEdit(row: AdminRow) {
    setEditingRow(row)
    setValues(createEditValues(config, row))
    setError("")
    setNotice("")
    setEditorOpen(true)
  }

  function closeEditor() {
    setEditorOpen(false)
    setEditingRow(null)
    setValues(createInitialValues(config))
  }

  function updateValue(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setNotice("")

    try {
      const payload = prepareAdminPayload(config, values)
      await saveAdminRow(
        config,
        payload,
        editingRow?.[config.primaryKey],
      )
      setNotice(`${config.singular} berhasil disimpan.`)
      closeEditor()
      await load()
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Gagal menyimpan data.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(row: AdminRow) {
    setBusy(true)
    setError("")
    try {
      await setAdminRowActive(
        config,
        row[config.primaryKey],
        !Boolean(row.is_active),
      )
      await load()
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : "Gagal mengubah status.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove(row: AdminRow) {
    setBusy(true)
    setError("")
    try {
      await deleteAdminRow(config, row[config.primaryKey])
      setNotice(`${config.singular} berhasil dihapus.`)
      await load()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Gagal menghapus data.",
      )
    } finally {
      setBusy(false)
    }
  }

  const imageField = config.fields.find((field) => field.type === "image")

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold">{config.title}</h1>
          <p className="mt-1 text-sm leading-6 text-stone-600">{config.description}</p>
        </div>
        <Button className="min-h-11 shrink-0" onClick={openCreate}>
          <Plus />
          <span className="hidden sm:inline">Tambah</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {editorOpen && (
        <AdminCard className="border-amber-300">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                {editingRow ? `Edit ${config.singular}` : `Tambah ${config.singular}`}
              </h2>
              <p className="text-xs text-stone-500">
                Field bertanda bintang wajib diisi.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeEditor}
              aria-label="Tutup form"
            >
              <X />
            </Button>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            {config.fields.map((field) => {
              const id = `${config.table}-${field.name}`
              const value = values[field.name]

              if (field.type === "checkbox") {
                return (
                  <div
                    key={field.name}
                    className="flex min-h-12 items-center justify-between gap-4 rounded-xl border bg-stone-50 px-3"
                  >
                    <label className="text-sm font-semibold" htmlFor={id}>
                      {field.label}
                    </label>
                    <Switch
                      id={id}
                      checked={Boolean(value)}
                      onCheckedChange={(checked) => updateValue(field.name, checked)}
                    />
                  </div>
                )
              }

              if (field.type === "image" && field.bucket) {
                return (
                  <AdminFormField
                    key={field.name}
                    label={field.label}
                    htmlFor={id}
                    required={field.required}
                    helpText={field.helpText}
                  >
                    <AdminImageUploader
                      bucket={field.bucket}
                      folder={field.folder ?? ""}
                      value={String(value ?? "")}
                      onChange={(path) => updateValue(field.name, path)}
                    />
                  </AdminFormField>
                )
              }

              if (field.type === "select") {
                const options = fieldOptions(field, relations)
                return (
                  <AdminFormField
                    key={field.name}
                    label={field.label}
                    htmlFor={id}
                    required={field.required}
                    helpText={field.helpText}
                  >
                    <select
                      id={id}
                      required={field.required}
                      value={String(value ?? "")}
                      onChange={(event) => updateValue(field.name, event.target.value)}
                      className="min-h-11 w-full rounded-md border border-input bg-white px-3 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 md:text-sm"
                    >
                      <option value="">Pilih {field.label.toLowerCase()}</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AdminFormField>
                )
              }

              if (
                field.type === "textarea" ||
                field.type === "json" ||
                field.type === "lines"
              ) {
                return (
                  <AdminFormField
                    key={field.name}
                    label={field.label}
                    htmlFor={id}
                    required={field.required}
                    helpText={field.helpText}
                  >
                    <Textarea
                      id={id}
                      required={field.required}
                      rows={field.type === "json" ? 10 : 5}
                      value={String(value ?? "")}
                      placeholder={field.placeholder}
                      className={field.type === "json" ? "font-mono text-xs" : ""}
                      onChange={(event) => updateValue(field.name, event.target.value)}
                    />
                  </AdminFormField>
                )
              }

              return (
                <AdminFormField
                  key={field.name}
                  label={field.label}
                  htmlFor={id}
                  required={field.required}
                  helpText={field.helpText}
                >
                  <Input
                    id={id}
                    type={field.type === "number" ? "number" : "text"}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    value={String(value ?? "")}
                    placeholder={field.placeholder}
                    onBlur={(event) => {
                      if (field.name === "slug" || field.name === "key") {
                        updateValue(field.name, normalizeSlug(event.target.value))
                      }
                    }}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                    className="min-h-11"
                  />
                </AdminFormField>
              )
            })}

            <div className="sticky bottom-20 z-10 grid grid-cols-2 gap-2 rounded-xl border bg-white/95 p-2 shadow-lg backdrop-blur md:bottom-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={closeEditor}
              >
                Batal
              </Button>
              <Button type="submit" className="min-h-11" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-3 size-4 text-stone-400" />
            <Input
              className="min-h-11 pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari data..."
            />
          </label>
          {config.filterField && (
            <select
              className="min-h-11 rounded-md border border-input bg-white px-3 text-sm"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter data"
            >
              <option value="">Semua</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden">Muat ulang</span>
          </Button>
        </div>
      </AdminCard>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center text-stone-500">
          <Loader2 className="mr-2 animate-spin" />
          Memuat data...
        </div>
      ) : visibleRows.length === 0 ? (
        <AdminEmptyState
          title={rows.length === 0 ? "Belum ada data" : "Data tidak ditemukan"}
          description={
            rows.length === 0
              ? `Tambahkan ${config.singular} pertama.`
              : "Coba ubah pencarian atau filter."
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visibleRows.map((row) => {
            const primaryValue = row[config.primaryKey]
            const active = "is_active" in row ? Boolean(row.is_active) : null

            return (
              <AdminCard
                key={String(primaryValue)}
                className={active === false ? "opacity-65" : ""}
              >
                {imageField?.bucket && Boolean(row[imageField.name]) && (
                  <div className="mb-4">
                    <AdminImagePreview
                      bucket={imageField.bucket}
                      path={String(row[imageField.name])}
                      alt={formatAdminFieldValue(row.title ?? row.label)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {config.previewFields
                    .filter((field) => field !== imageField?.name)
                    .map((field, index) => (
                      <div key={field}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                          {config.fields.find((item) => item.name === field)?.label ??
                            field}
                        </p>
                        <p
                          className={
                            index === 0
                              ? "font-semibold text-stone-900"
                              : "line-clamp-3 text-sm leading-6 text-stone-600"
                          }
                        >
                          {formatAdminFieldValue(row[field])}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10 flex-1"
                    onClick={() => openEdit(row)}
                  >
                    <Pencil />
                    Edit
                  </Button>
                  {active !== null && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-10 flex-1"
                      disabled={busy}
                      onClick={() => void toggleActive(row)}
                    >
                      {active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  )}
                  <AdminConfirmDialog
                    title={`Hapus ${config.singular}?`}
                    description="Data akan dihapus permanen. Nonaktifkan saja bila masih mungkin diperlukan."
                    confirmLabel="Hapus permanen"
                    onConfirm={() => remove(row)}
                    trigger={
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="size-10"
                        disabled={busy}
                        aria-label={`Hapus ${config.singular}`}
                      >
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
