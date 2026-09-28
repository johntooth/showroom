export function isValidHexColor(value: string): boolean {
  return /^#([0-9a-f]{6})$/i.test(value)
}

/** Picks black or white text for readable contrast against a given hex background. */
export function readableTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? "#161821" : "#ffffff"
}
