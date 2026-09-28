/** Deterministic hash → hue, so the same project name always gets the same color. */
function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function monogramColor(name: string, theme: "dark" | "light" = "dark"): string {
  const hue = hashString(name.trim().toLowerCase()) % 360
  const lightness = theme === "dark" ? 46 : 38
  return `hsl(${hue}, 42%, ${lightness}%)`
}

export function monogramInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase()
  return (words[0].slice(0, 1) + words[1].slice(0, 1)).toUpperCase()
}
