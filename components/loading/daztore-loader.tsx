import { cn } from "@/lib/utils"

interface DaztoreLoaderProps {
  fullscreen?: boolean
  label?: string
  className?: string
}

export function DaztoreLoader({
  fullscreen = false,
  label = "daztore.id",
  className,
}: DaztoreLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Memuat ${label}`}
      className={cn(
        "flex items-center justify-center",
        fullscreen &&
          "fixed inset-0 z-[90] min-h-dvh bg-background/95 px-6 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
          <span className="absolute inset-0 rounded-full border border-primary/20 bg-card/85 shadow-2xl shadow-primary/15" />
          <span className="absolute inset-2 rounded-full border border-primary/10" />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-transparent border-r-primary/30 border-t-primary/70 motion-safe:animate-spin motion-reduce:hidden"
            style={{ animationDuration: "1.4s" }}
          />
          <span
            aria-hidden
            className="relative h-14 w-12 motion-safe:animate-pulse sm:h-16 sm:w-14"
          >
            <span className="absolute inset-y-0 left-0 w-3.5 rounded-full bg-primary shadow-sm shadow-primary/30 sm:w-4" />
            <span className="absolute inset-y-0 left-2 right-0 rounded-r-full border-[10px] border-l-0 border-primary sm:border-[11px]" />
            <span className="absolute inset-y-[10px] left-[19px] right-[9px] rounded-r-full bg-card sm:left-[21px] sm:right-[10px]" />
          </span>
        </div>
        <div className="space-y-1">
          <p className="font-serif text-lg leading-none tracking-wide text-foreground">
            {label}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-primary">
            Memuat
          </p>
        </div>
      </div>
      <span className="sr-only">Memuat halaman.</span>
    </div>
  )
}
