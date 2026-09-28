interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 w-20 rounded-2xl border border-border opacity-20" />
        ))}
      </div>
      <div className="space-y-2">
        <h2 className="text-[22px] font-semibold text-text">No demos yet</h2>
        <p className="text-sm text-text-2">Add a URL and a name to create your first tile.</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-accent-text transition-opacity hover:opacity-90"
      >
        Add demo
      </button>
    </div>
  )
}
