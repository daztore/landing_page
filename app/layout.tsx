import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import { RouteLoadingProvider } from "@/components/loading/route-loading-provider"
import { getSiteUrl } from "@/lib/site-url"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const siteUrl = getSiteUrl()
const siteTitle = "daztore.id - Premium Mahar, Seserahan & Flower Bouquet"
const siteDescription =
  "Layanan premium untuk mahar, seserahan, dan flower bouquet dengan presentasi elegan dan storytelling yang bermakna. Wujudkan momen pernikahan impian Anda bersama daztore.id."
const ogImage = "/hero-mahar.webp"

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "mahar pernikahan",
    "seserahan premium",
    "flower bouquet wedding",
    "daztore",
    "daztore.id",
    "mahar elegan",
    "hantaran pernikahan",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "daztore.id",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Mahar dan seserahan premium daztore.id",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
}

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        <RouteLoadingProvider>{children}</RouteLoadingProvider>
        {process.env.NODE_ENV === "production" 
        // && <Analytics />
        }
      </body>
    </html>
  )
}
