import { useRef, useState } from "react"
import { X } from "lucide-react"
import type { Branding } from "../types"
import { isValidHexColor } from "../lib/color"

const MAX_IMAGE_BYTES = 300 * 1024
const DEFAULT_ACCENT = "#4c7df0"

interface SettingsModalProps {
  branding: Branding
  onUpdate: (patch: Partial<Branding>) => void
  onReset: (key: keyof Branding) => void
  onClose: () => void
  saveError: string | null
}

export function SettingsModal({ branding, onUpdate, onReset, onClose, saveError }: SettingsModalProps) {
  const [logoError, setLogoError] = useState<string | null>(null)
  const [faviconError, setFaviconError] = useState<string | null>(null)
  const [accentDraft, setAccentDraft] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const accentColor = branding.accentColor ?? DEFAULT_ACCENT
  const accentText = accentDraft ?? accentColor

  function handleImageUpload(
    file: File | undefined,
    field: "logo" | "favicon",
    setError: (msg: string | null) => void,
  ) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large — keep it under 300KB.")
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onUpdate({ [field]: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-[440px] rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 id="settings-title" className="text-[17px] font-semibold text-text">
              Branding
            </h2>
            <p className="mt-0.5 text-xs text-text-3">Applies to everyone using this deployment.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-text-3 hover:bg-white/10 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-2">Logo</span>
              {branding.logo && (
                <button
                  type="button"
                  onClick={() => onReset("logo")}
                  className="text-xs font-semibold text-text-3 hover:text-text"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-bg">
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-text-3">None</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-text-2 hover:bg-white/5 hover:text-text"
              >
                Upload image
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleImageUpload(e.target.files?.[0], "logo", setLogoError)
                  e.target.value = ""
                }}
              />
            </div>
            {logoError && <p className="mt-1.5 text-xs text-red-400">{logoError}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-2">Favicon</span>
              {branding.favicon && (
                <button
                  type="button"
                  onClick={() => onReset("favicon")}
                  className="text-xs font-semibold text-text-3 hover:text-text"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-bg">
                {branding.favicon ? (
                  <img src={branding.favicon} alt="Favicon preview" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-text-3">None</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-text-2 hover:bg-white/5 hover:text-text"
              >
                Upload image
              </button>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleImageUpload(e.target.files?.[0], "favicon", setFaviconError)
                  e.target.value = ""
                }}
              />
            </div>
            {faviconError && <p className="mt-1.5 text-xs text-red-400">{faviconError}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-2">Accent colour</span>
              {branding.accentColor && (
                <button
                  type="button"
                  onClick={() => {
                    onReset("accentColor")
                    setAccentDraft(null)
                  }}
                  className="text-xs font-semibold text-text-3 hover:text-text"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => {
                  onUpdate({ accentColor: e.target.value })
                  setAccentDraft(null)
                }}
                className="h-9 w-11 cursor-pointer rounded-lg border border-border bg-bg p-1"
              />
              <input
                type="text"
                value={accentText}
                onChange={(e) => {
                  const value = e.target.value
                  setAccentDraft(value)
                  if (isValidHexColor(value)) onUpdate({ accentColor: value })
                }}
                className="w-28 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {saveError && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {saveError} Changes are showing locally but were not saved for other viewers.
          </p>
        )}

        <div className="flex justify-end pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-accent-text hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
