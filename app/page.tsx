import { SiteNavigation } from "@/components/site-navigation"
import { Hero } from "@/components/hero"
import { Story } from "@/components/story"
import { OurProcess } from "@/components/our-process"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Gallery } from "@/components/gallery"
import { TestimonialsEnhanced } from "@/components/testimonials-enhanced"
import { FaqSection } from "@/components/faq-section"
import { UrgencySection } from "@/components/urgency-section"
import { FinalCta } from "@/components/final-cta"
import { WhatsappButton } from "@/components/whatsapp-button"
import { SiteFooter } from "@/components/site-footer"
import { getLandingPageData } from "@/lib/data/landing-page"

export const revalidate = 300

export default async function HomePage() {
  const data = await getLandingPageData()

  return (
    <>
      <SiteNavigation items={data.navigation} contact={data.contact} />
      <main>
        <Hero data={data.hero} whatsappNumber={data.contact.whatsappNumber} />
        <Story data={data.story} />
        <OurProcess data={data.process} />
        {/* <Packages /> - Coming Soon */}
        <WhyChooseUs data={data.features} />
        <Gallery data={data.gallery} />
        <TestimonialsEnhanced data={data.testimonials} />
        <FaqSection data={data.faq} whatsappNumber={data.contact.whatsappNumber} />
        <UrgencySection data={data.urgency} whatsappNumber={data.contact.whatsappNumber} />
        <FinalCta data={data.finalCta} contact={data.contact} />
      </main>
      <SiteFooter items={data.navigation} contact={data.contact} />
      <WhatsappButton whatsappNumber={data.contact.whatsappNumber} />
    </>
  )
}
