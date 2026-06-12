import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export interface AdminLinkItem {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

export function AdminLinkGrid({ items }: { items: AdminLinkItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-28 items-center gap-4 rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-stone-900">{item.title}</span>
              <span className="mt-1 block text-sm leading-5 text-stone-500">
                {item.description}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-stone-400" />
          </Link>
        )
      })}
    </div>
  )
}
