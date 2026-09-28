import { useCallback, useEffect, useState } from "react"
import type { Demo } from "../types"
import { STORAGE_KEYS, readStorage, writeStorage } from "../lib/storage"
import { parseHttpUrl } from "../lib/url"

function makeId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** localStorage is user-editable, so drop anything that isn't shaped like a demo rather than crash on it. */
function loadDemos(): Demo[] {
  const stored: unknown = readStorage(STORAGE_KEYS.demos, [])
  if (!Array.isArray(stored)) return []
  return stored.filter(
    (d): d is Demo =>
      typeof d === "object" &&
      d !== null &&
      typeof d.id === "string" &&
      typeof d.name === "string" &&
      typeof d.hostname === "string" &&
      typeof d.createdAt === "number" &&
      // Checked explicitly: parseHttpUrl would prefix "javascript://…" with https:// and accept it.
      typeof d.url === "string" &&
      /^https?:\/\//i.test(d.url),
  )
}

export function useDemos() {
  const [demos, setDemos] = useState<Demo[]>(loadDemos)

  useEffect(() => {
    writeStorage(STORAGE_KEYS.demos, demos)
  }, [demos])

  const addDemo = useCallback(
    (rawUrl: string, name: string, description?: string, keyFeatures?: string[]): Demo | null => {
      const parsed = parseHttpUrl(rawUrl)
      const trimmedName = name.trim()
      if (!parsed || !trimmedName) return null

      const demo: Demo = {
        id: makeId(),
        url: parsed.toString(),
        name: trimmedName,
        hostname: parsed.hostname,
        description: description?.trim() || undefined,
        keyFeatures: keyFeatures && keyFeatures.length > 0 ? keyFeatures : undefined,
        createdAt: Date.now(),
      }
      setDemos((prev) => [...prev, demo])
      return demo
    },
    [],
  )

  const updateDemo = useCallback(
    (id: string, rawUrl: string, name: string, description?: string, keyFeatures?: string[]): boolean => {
      const parsed = parseHttpUrl(rawUrl)
      const trimmedName = name.trim()
      if (!parsed || !trimmedName) return false

      setDemos((prev) =>
        prev.map((demo) =>
          demo.id === id
            ? {
                ...demo,
                url: parsed.toString(),
                name: trimmedName,
                hostname: parsed.hostname,
                description: description?.trim() || undefined,
                keyFeatures: keyFeatures && keyFeatures.length > 0 ? keyFeatures : undefined,
              }
            : demo,
        ),
      )
      return true
    },
    [],
  )

  // Reads from current state rather than the updater: React runs updaters during
  // render, so anything assigned inside one is still unset when this returns.
  const removeDemo = useCallback(
    (id: string): { demo: Demo; index: number } | null => {
      const index = demos.findIndex((d) => d.id === id)
      if (index === -1) return null
      setDemos((prev) => prev.filter((d) => d.id !== id))
      return { demo: demos[index], index }
    },
    [demos],
  )

  const restoreDemo = useCallback((demo: Demo, index: number) => {
    setDemos((prev) => {
      const next = [...prev]
      next.splice(Math.min(index, next.length), 0, demo)
      return next
    })
  }, [])

  const reorderDemo = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return
    setDemos((prev) => {
      const fromIndex = prev.findIndex((d) => d.id === draggedId)
      const toIndex = prev.findIndex((d) => d.id === targetId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  return { demos, addDemo, updateDemo, removeDemo, restoreDemo, reorderDemo }
}
