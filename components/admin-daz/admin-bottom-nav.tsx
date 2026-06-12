"use client"

import {
  House,
  Images,
  LayoutTemplate,
  PackageSearch,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const items = [
  { href: "/admin-daz/dashboard", label: "Dashboard", icon: House },
  { href: "/admin-daz/landing", label: "Landing", icon: LayoutTemplate },
  { href: "/admin-daz/catalog", label: "Katalog", icon: PackageSearch },
  { href: "/admin-daz/media", label: "Media", icon: Images },
  { href: "/admin-daz/settings", label: "Settings", icon: Settings },
]

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:static md:h-full md:border-r md:border-t-0">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 md:h-auto md:grid-cols-1 md:gap-2 md:p-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin-daz/dashboard" &&
              pathname.startsWith(`${item.href}/`))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-stone-500 md:min-h-12 md:flex-row md:justify-start md:rounded-xl md:px-3 md:text-sm",
                active && "bg-amber-50 text-amber-800",
              )}
            >
              <Icon className="size-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
