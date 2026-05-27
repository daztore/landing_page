'use client'

import { useEffect, useState } from 'react'

interface FloatingFlowerProps {
  delay?: number
  duration?: number
  xStart?: number
  className?: string
}

export function FloatingFlower({
  delay = 0,
  duration = 6,
  xStart = 0,
  className = '',
}: FloatingFlowerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`pointer-events-none fixed ${className}`}
      style={
        {
          '--delay': `${delay}s`,
          '--duration': `${duration}s`,
          '--x-start': `${xStart}px`,
          animation: `floatDown var(--duration) linear var(--delay) infinite`,
        } as React.CSSProperties & {
          '--delay'?: string
          '--duration'?: string
          '--x-start'?: string
        }
      }
    >
      {/* Rose petal SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary/40"
      >
        <path
          d="M10 2C6 2 3 5 3 10C3 15 10 18 10 18C10 18 17 15 17 10C17 5 14 2 10 2Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
