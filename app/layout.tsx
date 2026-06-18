import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { RouteLoadingProvider } from "@/components/loading/route-loading-provider"
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

export const metadata: Metadata = {
  title: "daztore.id — Premium Mahar, Seserahan & Flower Bouquet",
  description:
    "Layanan premium untuk mahar, seserahan, dan flower bouquet dengan presentasi elegan dan storytelling yang bermakna. Wujudkan momen pernikahan impian Anda bersama daztore.id.",
  keywords: [
    "mahar pernikahan",
    "seserahan premium",
    "flower bouquet wedding",
    "daztore",
    "daztore.id",
    "mahar elegan",
    "hantaran pernikahan",
  ],
  openGraph: {
    title: "daztore.id — Premium Mahar, Seserahan & Flower Bouquet",
    description:
      "Wujudkan momen pernikahan impian dengan mahar dan seserahan premium yang elegan dan bermakna.",
    type: "website",
  },
  generator: "v0.app",
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
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
