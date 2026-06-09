import { Instagram, Mail, MapPin } from "lucide-react"
import { fallbackContact, fallbackNavigation } from "@/lib/data/fallback"
import type { NavigationItem, SiteContact } from "@/lib/data/types"

interface SiteFooterProps {
  items?: NavigationItem[]
  contact?: SiteContact
}

export function SiteFooter({
  items = fallbackNavigation,
  contact = fallbackContact,
}: SiteFooterProps) {
  const footerItems = items.filter((item) => item.placement === "footer")

  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href="#top" className="flex items-baseline gap-1">
              <span className="font-serif text-3xl tracking-tight text-foreground">
                {contact.brandName}
              </span>
              <span className="font-serif text-3xl tracking-tight text-primary">
                {contact.brandSuffix}
              </span>
            </a>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              {contact.footerDescription}
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.22em] text-primary">Menu</div>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              {footerItems.map((item) => (
                <li key={item.slug}>
                  <a href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.22em] text-primary">Kontak</div>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>{contact.location} · {contact.deliveryArea}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="mt-0.5 h-4 w-4 text-primary" />
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {contact.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row">
          <div>
            &copy; {new Date().getFullYear()} {contact.brandName}{contact.brandSuffix} — Crafted with love.
          </div>
          <div className="flex items-center gap-6">
            <a href={contact.privacyUrl} className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href={contact.termsUrl} className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
