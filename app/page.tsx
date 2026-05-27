import { SiteNavigation } from "@/components/site-navigation"
import { Hero } from "@/components/hero"
import { Story } from "@/components/story"
import { OurProcess } from "@/components/our-process"
import { Packages } from "@/components/packages"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Gallery } from "@/components/gallery"
import { TestimonialsEnhanced } from "@/components/testimonials-enhanced"
import { FaqSection } from "@/components/faq-section"
import { UrgencySection } from "@/components/urgency-section"
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
        <OurProcess />
        {/* <Packages /> - Coming Soon */}
        <WhyChooseUs />
        <Gallery />
        <TestimonialsEnhanced />
        <FaqSection />
        <UrgencySection />
        <FinalCta />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </>
  )
}
