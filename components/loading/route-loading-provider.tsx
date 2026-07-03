"use client"

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { DaztoreLoader } from "@/components/loading/daztore-loader"

const SHOW_DELAY_MS = 180
const MIN_VISIBLE_MS = 220
const SAFETY_TIMEOUT_MS = 6500

interface RouteLoadingContextValue {
  startLoading: () => void
}

const RouteLoadingContext = createContext<RouteLoadingContextValue>({
  startLoading: () => {},
})

function shouldHandleAnchor(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false
  }

  const href = anchor.getAttribute("href")
  if (!href || href.startsWith("#")) {
    return false
  }

  const target = anchor.getAttribute("target")
  if ((target && target.toLowerCase() !== "_self") || anchor.hasAttribute("download")) {
    return false
  }

  if (/^(mailto:|tel:|sms:|whatsapp:|javascript:)/i.test(href)) {
    return false
  }

  let destination: URL
  try {
    destination = new URL(href, window.location.href)
    if (destination.origin !== window.location.origin) {
      return false
    }
  } catch {
    return false
  }

  const current = new URL(window.location.href)
  return destination.pathname !== current.pathname || destination.search !== current.search
}

function createNavigationKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname
}

function getCurrentNavigationKey() {
  return createNavigationKey(
    window.location.pathname,
    window.location.search.replace(/^\?/, ""),
  )
}

function RouteLoadingCompletion({
  onComplete,
}: {
  onComplete: (navigationKey: string) => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    onComplete(createNavigationKey(pathname, search))
  }, [onComplete, pathname, search])

  return null
}

export function useRouteLoading() {
  return useContext(RouteLoadingContext)
}

export function RouteLoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)
  const shownAtRef = useRef(0)
  const currentNavigationKeyRef = useRef("")
  const showTimerRef = useRef<number | undefined>(undefined)
  const hideTimerRef = useRef<number | undefined>(undefined)
  const safetyTimerRef = useRef<number | undefined>(undefined)

  const setLoaderVisible = useCallback((nextVisible: boolean) => {
    visibleRef.current = nextVisible
    setVisible(nextVisible)
  }, [])

  const clearTimer = useCallback((timerRef: MutableRefObject<number | undefined>) => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const hideNow = useCallback(() => {
    clearTimer(showTimerRef)
    clearTimer(hideTimerRef)
    clearTimer(safetyTimerRef)
    setLoaderVisible(false)
  }, [clearTimer, setLoaderVisible])

  const startLoading = useCallback(() => {
    clearTimer(showTimerRef)
    clearTimer(hideTimerRef)
    clearTimer(safetyTimerRef)

    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = undefined
      shownAtRef.current = Date.now()
      setLoaderVisible(true)
      safetyTimerRef.current = window.setTimeout(hideNow, SAFETY_TIMEOUT_MS)
    }, SHOW_DELAY_MS)
  }, [clearTimer, hideNow, setLoaderVisible])

  const finishLoading = useCallback(() => {
    clearTimer(showTimerRef)

    if (!visibleRef.current) {
      return
    }

    clearTimer(hideTimerRef)
    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAtRef.current))

    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = undefined
      hideNow()
    }, remaining)
  }, [clearTimer, hideNow])

  const finishRouteLoading = useCallback((navigationKey: string) => {
    currentNavigationKeyRef.current = navigationKey
    finishLoading()
  }, [finishLoading])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (anchor && shouldHandleAnchor(anchor, event)) {
        startLoading()
      }
    }

    const handlePopState = () => {
      const nextNavigationKey = getCurrentNavigationKey()
      if (nextNavigationKey !== currentNavigationKeyRef.current) {
        startLoading()
      }
    }

    currentNavigationKeyRef.current = getCurrentNavigationKey()
    document.addEventListener("click", handleClick, true)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("popstate", handlePopState)
      clearTimer(showTimerRef)
      clearTimer(hideTimerRef)
      clearTimer(safetyTimerRef)
    }
  }, [clearTimer, startLoading])

  return (
    <RouteLoadingContext.Provider value={{ startLoading }}>
      {children}
      <Suspense fallback={null}>
        <RouteLoadingCompletion onComplete={finishRouteLoading} />
      </Suspense>
      {visible && <DaztoreLoader fullscreen />}
    </RouteLoadingContext.Provider>
  )
}
