"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = window.setTimeout(() => setVisible(true), delay)
          io.disconnect()
          return () => window.clearTimeout(t)
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={cn("reveal", visible && "is-visible", className)}>
      {children}
    </div>
  )
}
