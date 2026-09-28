import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import type { Demo } from "../types"
import { parseHttpUrl } from "../lib/url"

interface DemoModalProps {
  /** The demo being edited, or undefined when adding a new one. */
  demo?: Demo
  initialUrl?: string
  onClose: () => void
  onSubmit: (url: string, name: string, description?: string, keyFeatures?: string[]) => void
}

export function DemoModal({ demo, initialUrl = "", onClose, onSubmit }: DemoModalProps) {
  const isEditing = demo !== undefined
  const [url, setUrl] = useState(demo?.url ?? initialUrl)
  const [name, setName] = useState(demo?.name ?? "")
  const [description, setDescription] = useState(demo?.description ?? "")
  const [features, setFeatures] = useState(demo?.keyFeatures?.join("\n") ?? "")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Selecting the whole URL is right when adding (it is usually pasted), but
    // destructive when editing — one keystroke would wipe an existing URL.
    if (isEditing) {
      nameInputRef.current?.focus()
      return
    }
    urlInputRef.current?.focus()
    urlInputRef.current?.select()
  }, [isEditing])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validUrl = parseHttpUrl(url)
    const trimmedName = name.trim()

    let hasError = false
    if (!validUrl) {
      setUrlError("Enter a valid http(s) URL.")
      hasError = true
    } else {
      setUrlError(null)
    }
    if (!trimmedName) {
      setNameError("Give this demo a name.")
      hasError = true
    } else {
      setNameError(null)
    }
    if (hasError) return

    const keyFeatures = features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean)

    onSubmit(url, trimmedName, description.trim(), keyFeatures)
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
        aria-labelledby="demo-modal-title"
        className="w-full max-w-[440px] rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="demo-modal-title" className="text-[17px] font-semibold text-text">
            {isEditing ? "Edit demo" : "Add demo"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-text-3 hover:bg-white/10 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="demo-url" className="mb-1.5 block text-xs font-semibold text-text-2">
              URL
            </label>
            <input
              id="demo-url"
              ref={urlInputRef}
              type="text"
              inputMode="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent"
            />
            {urlError && <p className="mt-1.5 text-xs text-red-400">{urlError}</p>}
          </div>

          <div>
            <label htmlFor="demo-name" className="mb-1.5 block text-xs font-semibold text-text-2">
              Project name
            </label>
            <input
              id="demo-name"
              ref={nameInputRef}
              type="text"
              placeholder="e.g. Pricing prototype"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent"
            />
            {nameError && <p className="mt-1.5 text-xs text-red-400">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="demo-description" className="mb-1.5 block text-xs font-semibold text-text-2">
              Description <span className="font-normal text-text-3">(optional)</span>
            </label>
            <input
              id="demo-description"
              type="text"
              placeholder="One sentence about what this demo does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="demo-features" className="mb-1.5 block text-xs font-semibold text-text-2">
              Key features <span className="font-normal text-text-3">(optional, one per line)</span>
            </label>
            <textarea
              id="demo-features"
              rows={3}
              placeholder={"Real-time collaboration\nOffline support"}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[13.5px] font-semibold text-text-2 hover:bg-white/5 hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-accent-text hover:opacity-90"
            >
              {isEditing ? "Save changes" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
