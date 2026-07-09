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
const siteTitle = "Daztore.id | Mahar, Seserahan, Bouquet & Gift Custom"
const siteDescription =
  "Daztore.id membantu menyiapkan mahar, seserahan, bouquet, hampers, dan gift custom dengan tampilan elegan, hangat, dan personal."
const ogImage = "/brand/og-image.jpg"

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  applicationName: "Daztore.id",
  keywords: [
    "mahar pernikahan",
    "seserahan premium",
    "bouquet wedding",
    "gift custom",
    "hampers premium",
    "Daztore.id",
    "mahar elegan",
    "hantaran pernikahan",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Daztore.id",
    locale: "id_ID",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Daztore.id - Mahar, Seserahan, Bouquet & Gift Custom",
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
  themeColor: "#fff8f3",
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
