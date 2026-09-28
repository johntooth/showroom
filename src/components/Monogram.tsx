import { useState } from "react"
import { monogramColor, monogramInitials } from "../lib/monogram"
import { faviconUrlFor } from "../lib/url"
import type { Theme } from "../types"

interface MonogramProps {
  name: string
  url: string
  theme: Theme
}

/**
 * Renders the initials badge immediately; the favicon request happens in the
 * background and cross-fades in on top if it ever resolves. There is no
 * loading or error state — the monogram is the design, not a fallback.
 */
export function Monogram({ name, url, theme }: MonogramProps) {
  const [faviconLoaded, setFaviconLoaded] = useState(false)
  const faviconUrl = faviconUrlFor(url)

  return (
    <div
      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl"
      style={{ backgroundColor: monogramColor(name, theme) }}
    >
      <span className="absolute inset-0 flex items-center justify-center font-semibold text-[17px] text-white">
        {monogramInitials(name)}
      </span>
      {faviconUrl && (
        <img
          src={faviconUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          onLoad={() => setFaviconLoaded(true)}
          onError={() => setFaviconLoaded(false)}
          className="absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-150"
          style={{ opacity: faviconLoaded ? 1 : 0 }}
        />
      )}
    </div>
  )
}
