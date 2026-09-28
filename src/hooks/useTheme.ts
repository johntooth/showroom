import { useEffect, useState } from "react"
import type { Theme } from "../types"
import { STORAGE_KEYS, readStorage, writeStorage } from "../lib/storage"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    readStorage<Theme>(STORAGE_KEYS.theme, "dark") === "light" ? "light" : "dark",
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    writeStorage(STORAGE_KEYS.theme, theme)
  }, [theme])

  function toggle() {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }

  return { theme, toggle }
}
