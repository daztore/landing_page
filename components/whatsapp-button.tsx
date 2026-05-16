"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function WhatsappButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <a
      href="https://wa.me/6281234567890?text=Halo%20daztore.id%2C%20saya%20tertarik%20dengan%20layanan%20Anda."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat via WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#25D366] pl-4 pr-5 py-3 text-sm font-medium text-white shadow-xl shadow-[#25D366]/30 transition-all duration-500 md:bottom-7 md:right-7",
        visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none",
      )}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-white/30"
          style={{ animationDuration: "2.5s" }}
        />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4 fill-white"
          aria-hidden
        >
          <path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.49 0 .16 5.33.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.31-1.66a11.88 11.88 0 0 0 5.75 1.47h.01c6.57 0 11.9-5.33 11.9-11.9a11.8 11.8 0 0 0-3.45-8.43ZM12.06 21.3h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.75.98 1-3.66-.22-.37a9.4 9.4 0 0 1-1.44-5.02c0-5.18 4.22-9.4 9.41-9.4a9.4 9.4 0 0 1 9.39 9.41c0 5.18-4.21 9.4-9.4 9.4Zm5.42-7.03c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48a9.06 9.06 0 0 1-1.67-2.07c-.18-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.5.71.3 1.26.48 1.69.62.71.22 1.36.2 1.87.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        </svg>
      </span>
      <span className="hidden sm:inline">Chat Sekarang</span>
    </a>
  )
}
