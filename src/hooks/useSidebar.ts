import { useEffect, useState } from "react"
import { STORAGE_KEYS, readStorage, writeStorage } from "../lib/storage"

export type SidebarBreakpoint = "desktop" | "tablet" | "mobile"

function getBreakpoint(width: number): SidebarBreakpoint {
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

export function useSidebar() {
  const [breakpoint, setBreakpoint] = useState<SidebarBreakpoint>(() =>
    getBreakpoint(typeof window === "undefined" ? 1280 : window.innerWidth),
  )
  // The user's manual preference. Defaults to collapsed below the desktop
  // breakpoint on first load, but from then on the user's own toggle wins —
  // mobile is the one exception, where the off-canvas `mobileOpen` state
  // takes over instead.
  const [manualCollapsed, setManualCollapsed] = useState<boolean>(() =>
    readStorage(STORAGE_KEYS.sidebarCollapsed, breakpoint !== "desktop"),
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onResize() {
      setBreakpoint(getBreakpoint(window.innerWidth))
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.sidebarCollapsed, manualCollapsed)
  }, [manualCollapsed])

  const collapsed = breakpoint === "mobile" ? false : manualCollapsed

  function toggle() {
    if (breakpoint === "mobile") {
      setMobileOpen((open) => !open)
    } else {
      setManualCollapsed((c) => !c)
    }
  }

  return {
    breakpoint,
    collapsed,
    mobileOpen,
    setMobileOpen,
    toggle,
  }
}
