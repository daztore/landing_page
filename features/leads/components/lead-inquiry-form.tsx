"use client"

import { AlertCircle, CheckCircle2, MessageCircle, Send } from "lucide-react"
import { useState } from "react"

import { leadBudgetRanges } from "@/features/leads"
import { leadConsentText } from "@/features/leads/validation/lead-request"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

interface LeadInquiryFormProps {
  productSlug: string
  productTitle: string
  productCategoryName: string
  defaultMessage: string
  whatsappNumber: string
  privacyUrl?: string
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string; whatsappUrl: string }
  | { status: "error"; message: string }

export function LeadInquiryForm({
  productSlug,
  productTitle,
  productCategoryName,
  defaultMessage,
  whatsappNumber,
  privacyUrl,
}: LeadInquiryFormProps) {
  const [formStartedAt] = useState(() => Date.now())
  const [state, setState] = useState<SubmitState>({ status: "idle" })
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    email: "",
    eventDate: "",
    budgetRange: "",
    message: defaultMessage,
    consentAccepted: false,
    website: "",
  })

  const loading = state.status === "submitting"

  function updateField(
    field: keyof typeof formData,
    value: string | boolean,
  ) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: "submitting" })

    const sourceUrl = typeof window !== "undefined" ? window.location.href : undefined

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "product_detail",
          name: formData.name,
          whatsappNumber: formData.whatsappNumber,
          email: formData.email,
          productSlug,
          interestCategory: productCategoryName,
          eventDate: formData.eventDate,
          budgetRange: formData.budgetRange,
          message: formData.message,
          consentAccepted: formData.consentAccepted,
          sourceUrl,
          formStartedAt,
          website: formData.website,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        message?: string
        error?: string
      } | null

      if (!response.ok) {
        setState({
          status: "error",
          message: payload?.error ?? "Inquiry belum bisa dikirim. Silakan coba lagi.",
        })
        return
      }

      const whatsappMessage = `Halo daztore.id, saya ${formData.name}. Saya sudah mengirim inquiry untuk ${productTitle}. ${formData.message}`

      setState({
        status: "success",
        message: payload?.message ?? "Inquiry berhasil diterima.",
        whatsappUrl: buildWhatsAppUrl(whatsappNumber, whatsappMessage),
      })
    } catch {
      setState({
        status: "error",
        message: "Koneksi bermasalah. Silakan coba lagi atau lanjut via WhatsApp.",
      })
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="font-serif text-xl font-semibold">Inquiry diterima</h2>
            <p className="mt-2 text-sm leading-6">{state.message}</p>
            <a
              href={state.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Lanjut chat WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={submitInquiry}
      className="rounded-lg border border-border/60 bg-card p-4 shadow-sm sm:p-5"
    >
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={(event) => updateField("website", event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <p className="text-sm font-medium text-primary">Inquiry produk</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">
          Konsultasi {productTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Isi data singkat agar admin bisa follow-up kebutuhan custom, jadwal, dan estimasi.
        </p>
      </div>

      {state.status === "error" && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="text-sm font-medium text-foreground">
            Nama lengkap
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label htmlFor="lead-whatsapp" className="text-sm font-medium text-foreground">
            WhatsApp
          </label>
          <input
            id="lead-whatsapp"
            name="whatsappNumber"
            type="tel"
            value={formData.whatsappNumber}
            onChange={(event) => updateField("whatsappNumber", event.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xx xxxx xxxx"
            className="mt-2 w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label htmlFor="lead-email" className="text-sm font-medium text-foreground">
            Email opsional
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            maxLength={160}
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label htmlFor="lead-event-date" className="text-sm font-medium text-foreground">
            Tanggal acara opsional
          </label>
          <input
            id="lead-event-date"
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={(event) => updateField("eventDate", event.target.value)}
            className="mt-2 w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="lead-budget" className="text-sm font-medium text-foreground">
          Range budget opsional
        </label>
        <select
          id="lead-budget"
          name="budgetRange"
          value={formData.budgetRange}
          onChange={(event) => updateField("budgetRange", event.target.value)}
          className="mt-2 w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Pilih range budget</option>
          {leadBudgetRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="lead-message" className="text-sm font-medium text-foreground">
          Catatan kebutuhan
        </label>
        <textarea
          id="lead-message"
          name="message"
          value={formData.message}
          onChange={(event) => updateField("message", event.target.value)}
          maxLength={1000}
          rows={5}
          className="mt-2 w-full resize-none rounded-lg border border-border/60 bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input
          type="checkbox"
          checked={formData.consentAccepted}
          onChange={(event) => updateField("consentAccepted", event.target.checked)}
          required
          className="mt-1 h-4 w-4 rounded border-border text-primary"
        />
        <span>
          {leadConsentText}
          {privacyUrl && privacyUrl !== "#" && (
            <>
              {" "}
              <a href={privacyUrl} className="font-medium text-primary hover:underline">
                Kebijakan privasi
              </a>
            </>
          )}
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim inquiry"}
      </button>
    </form>
  )
}
