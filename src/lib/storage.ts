export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return (JSON.parse(raw) ?? fallback) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable (private mode, quota) — state just won't persist
  }
}

export const STORAGE_KEYS = {
  demos: "showroom.demos",
  sidebarCollapsed: "showroom.sidebar-collapsed",
  theme: "showroom.theme",
  viewMode: "showroom.view-mode",
} as const
