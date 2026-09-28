export function parseHttpUrl(raw: string): URL | null {
  let candidate = raw.trim()
  if (!candidate) return null
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`
  }
  try {
    const url = new URL(candidate)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url
  } catch {
    return null
  }
}

export function faviconUrlFor(pageUrl: string): string | null {
  const url = parseHttpUrl(pageUrl)
  if (!url) return null
  return `${url.origin}/favicon.ico`
}
