"use client"

import { useState } from "react"
import { Send } from "lucide-react"

export function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    weddingDate: "",
    budget: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Format WhatsApp message
    const message = `Halo daztore.id, saya ${formData.name}
Tanggal Pernikahan: ${formData.weddingDate}
Budget: ${formData.budget}
Pesan: ${formData.message}`

    const whatsappUrl = `https://wa.me/628775687555?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", phone: "", weddingDate: "", budget: "", message: "" })
      setSubmitted(false)
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama Anda"
            required
            className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Nomor WhatsApp
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="08xx xxxx xxxx"
            className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="weddingDate" className="block text-sm font-medium text-foreground mb-2">
            Tanggal Pernikahan
          </label>
          <input
            type="date"
            id="weddingDate"
            name="weddingDate"
            value={formData.weddingDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-2">
            Budget Estimasi
          </label>
          <select
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          >
            <option value="">Pilih range budget</option>
            <option value="< 3juta">Kurang dari 3 juta</option>
            <option value="3-5 juta">3-5 juta</option>
            <option value="5-10 juta">5-10 juta</option>
            <option value="10-20 juta">10-20 juta</option>
            <option value="> 20juta">Lebih dari 20 juta</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          Pesan (Opsional)
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Ceritakan visi Anda untuk hari istimewa..."
          rows={4}
          className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
      >
        <Send className="h-4 w-4" />
        {submitted ? "Dikirim ke WhatsApp!" : "Kirim Ke WhatsApp"}
      </button>
    </form>
  )
}
