import { Megaphone } from "lucide-react"

interface BannerProps {
  message: string
}

/**
 * Deployment-wide system message, set by ops in /config.json. Deliberately not
 * dismissible: it stays pinned with the header for as long as a message is set.
 */
export function Banner({ message }: BannerProps) {
  return (
    <div
      role="region"
      aria-label="System message"
      // Opaque (accent tinted over the surface) because content scrolls beneath it.
      className="flex items-start gap-2 border-b border-border bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-2))] px-4 py-2 text-[13px] text-text md:px-8"
    >
      <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <p className="min-w-0 flex-1 break-words">{message}</p>
    </div>
  )
}
