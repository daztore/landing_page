import { SiteNavigation } from "@/components/site-navigation"
import { Hero } from "@/components/hero"
import { Story } from "@/components/story"
import { Packages } from "@/components/packages"
import { Gallery } from "@/components/gallery"
import { Testimonials } from "@/components/testimonials"
import { FinalCta } from "@/components/final-cta"
import { WhatsappButton } from "@/components/whatsapp-button"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <>
      <SiteNavigation />
      <main>
        <Hero />
        <Story />
        <Packages />
        <Gallery />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </>
  )
}
