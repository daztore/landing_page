import { cn } from "@/lib/utils"

export function AdminCard({
  className,
  children,
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  )
}
