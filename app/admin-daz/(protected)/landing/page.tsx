import {
  CircleHelp,
  Images,
  LayoutList,
  LayoutTemplate,
  Menu,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react"

import { AdminLinkGrid } from "@/components/admin-daz/admin-link-grid"

const links = [
  {
    href: "/admin-daz/landing/sections",
    title: "Sections",
    description: "Heading, gambar, dan konten JSON section",
    icon: LayoutTemplate,
  },
  {
    href: "/admin-daz/landing/items",
    title: "Landing Items",
    description: "Metrik, proses, fitur, dan trust point",
    icon: LayoutList,
  },
  {
    href: "/admin-daz/landing/navigation",
    title: "Navigation",
    description: "Menu header, mobile, CTA, dan footer",
    icon: Menu,
  },
  {
    href: "/admin-daz/landing/gallery",
    title: "Gallery",
    description: "Gambar portofolio landing page",
    icon: Images,
  },
  {
    href: "/admin-daz/landing/testimonials",
    title: "Testimonials",
    description: "Testimonial grid dan carousel",
    icon: MessageSquareQuote,
  },
  {
    href: "/admin-daz/landing/faqs",
    title: "FAQ",
    description: "Pertanyaan dan jawaban",
    icon: CircleHelp,
  },
  {
    href: "/admin-daz/landing/packages",
    title: "Packages",
    description: "Tier paket yang tersimpan di database",
    icon: Sparkles,
  },
]

export default function AdminLandingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Landing Page</h1>
        <p className="mt-1 text-sm text-stone-600">
          Pilih jenis konten yang akan dikelola.
        </p>
      </div>
      <AdminLinkGrid items={links} />
    </div>
  )
}
