interface ToastProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function Toast({ message, actionLabel, onAction }: ToastProps) {
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text shadow-xl">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="font-semibold text-accent hover:opacity-80"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
