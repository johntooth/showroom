import { randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/** ~300KB of binary, once base64-encoded, plus the data-URI header. */
const MAX_ASSET_CHARS = 420_000
const ASSET_PATTERN =
  /^data:image\/(png|jpeg|gif|webp|svg\+xml|x-icon|vnd\.microsoft\.icon);base64,[A-Za-z0-9+/]+={0,2}$/
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

export function brandingFilePath(dataDir) {
  return path.join(dataDir, "branding.json")
}

export async function readBranding(dataDir) {
  try {
    const raw = await readFile(brandingFilePath(dataDir), "utf8")
    return sanitizeBranding(JSON.parse(raw)).value
  } catch {
    return {}
  }
}

export async function writeBranding(dataDir, incoming) {
  const { value, error } = sanitizeBranding(incoming)
  if (error) return { error }

  await mkdir(dataDir, { recursive: true })
  const file = brandingFilePath(dataDir)
  // Write-then-rename so a crash mid-write can't leave a half-written file
  // that every future page load would fail to parse.
  // Unique per write, so two overlapping PUTs can't interleave into one temp file.
  const temp = `${file}.${randomUUID()}.tmp`
  await writeFile(temp, JSON.stringify(value), "utf8")
  await rename(temp, file)
  return { value }
}

export function sanitizeBranding(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { value: {}, error: "Expected a branding object." }
  }

  const value = {}

  if (input.accentColor !== undefined) {
    if (typeof input.accentColor !== "string" || !HEX_PATTERN.test(input.accentColor)) {
      return { value: {}, error: "accentColor must be a #rrggbb hex string." }
    }
    value.accentColor = input.accentColor.toLowerCase()
  }

  for (const key of ["logo", "favicon"]) {
    const asset = input[key]
    if (asset === undefined) continue
    if (typeof asset !== "string") {
      return { value: {}, error: `${key} must be a base64 image data URI.` }
    }
    // Length first: never run the pattern over an arbitrarily large string.
    if (asset.length > MAX_ASSET_CHARS) {
      return { value: {}, error: `${key} is too large — keep it under 300KB.` }
    }
    if (!ASSET_PATTERN.test(asset)) {
      return { value: {}, error: `${key} must be a base64 image data URI.` }
    }
    value[key] = asset
  }

  return { value }
}
