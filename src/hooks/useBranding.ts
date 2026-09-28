import { useCallback, useEffect, useRef, useState } from "react"
import type { Branding } from "../types"
import { readableTextColor } from "../lib/color"

const FAVICON_LINK_ID = "app-favicon"
const SAVE_DEBOUNCE_MS = 500

/**
 * Branding is deployment-wide: it lives in a JSON file on the server's data
 * volume, so every visitor sees the same logo, favicon and accent colour.
 * Edits are unauthenticated, like the rest of the app.
 */
export function useBranding() {
  const [branding, setBranding] = useState<Branding>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const lastSavedRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/branding")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Branding) => {
        if (cancelled) return
        lastSavedRef.current = JSON.stringify(data ?? {})
        setBranding(data ?? {})
      })
      .catch(() => {
        if (!cancelled) lastSavedRef.current = "{}"
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const serialized = JSON.stringify(branding)
    if (lastSavedRef.current === null || lastSavedRef.current === serialized) return

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/branding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: serialized,
        })
        if (!res.ok) {
          const detail = await res.json().catch(() => null)
          throw new Error(detail?.error ?? `Save failed (${res.status}).`)
        }
        lastSavedRef.current = serialized
        setSaveError(null)
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Could not save branding.")
      }
    }, SAVE_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [branding])

  useEffect(() => {
    let link = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement("link")
      link.id = FAVICON_LINK_ID
      link.rel = "icon"
      document.head.appendChild(link)
    }
    link.href = branding.favicon || "/favicon.svg"
  }, [branding.favicon])

  useEffect(() => {
    const root = document.documentElement
    if (branding.accentColor) {
      root.style.setProperty("--color-accent", branding.accentColor)
      root.style.setProperty("--color-accent-text", readableTextColor(branding.accentColor))
    } else {
      root.style.removeProperty("--color-accent")
      root.style.removeProperty("--color-accent-text")
    }
  }, [branding.accentColor])

  const updateBranding = useCallback((patch: Partial<Branding>) => {
    setBranding((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetBranding = useCallback((key: keyof Branding) => {
    setBranding((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  return { branding, updateBranding, resetBranding, saveError }
}
