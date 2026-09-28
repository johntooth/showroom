import { useState } from "react"
import { Megaphone, X } from "lucide-react"

interface BannerProps {
  message: string
}

export function Banner({ message }: BannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      role="status"
      className="flex items-start gap-2 border-b border-border bg-accent/10 px-4 py-2 text-[13px] text-text md:px-8"
    >
      <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <p className="min-w-0 flex-1">{message}</p>
      <button
        type="button"
        aria-label="Dismiss banner"
        onClick={() => setDismissed(true)}
        className="-mt-0.5 shrink-0 rounded-md p-1 text-text-3 hover:bg-white/10 hover:text-text"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
