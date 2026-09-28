import { useState } from "react"
import { ChevronDown, Pencil, X } from "lucide-react"
import type { Demo, Theme } from "../types"
import { Monogram } from "./Monogram"

interface TileProps {
  demo: Demo
  theme: Theme
  compact: boolean
  reorderable: boolean
  isDragging: boolean
  isDragOver: boolean
  onRemove: (id: string) => void
  onEdit: (demo: Demo) => void
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDrop: (id: string) => void
  onDragEnd: () => void
}

export function Tile({
  demo,
  theme,
  compact,
  reorderable,
  isDragging,
  isDragOver,
  onRemove,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TileProps) {
  const [expanded, setExpanded] = useState(false)
  const hasFeatures = !compact && (demo.keyFeatures?.length ?? 0) > 0

  return (
    <div
      id={`tile-${demo.id}`}
      draggable={reorderable}
      onDragStart={() => onDragStart(demo.id)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(demo.id)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(demo.id)
      }}
      onDragEnd={onDragEnd}
      onKeyDown={(e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault()
          onRemove(demo.id)
        }
      }}
      className={`group relative scroll-mt-32 animate-tile-in rounded-2xl border transition-all duration-150 active:scale-[0.98] ${
        compact ? "p-3" : "min-h-[188px] p-4"
      } ${
        isDragOver
          ? "border-2 border-dashed border-accent"
          : "border-border bg-surface hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg"
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <button
          type="button"
          aria-label={`Edit ${demo.name}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit(demo)
          }}
          className="rounded-md p-1 text-text-3 hover:bg-white/10 hover:text-text"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Remove ${demo.name}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove(demo.id)
          }}
          className="rounded-md p-1 text-text-3 hover:bg-white/10 hover:text-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <a
        href={demo.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl ${
          compact ? "flex items-center gap-3" : "flex flex-col items-start gap-3"
        }`}
      >
        <Monogram name={demo.name} url={demo.url} theme={theme} />
        <div className="min-w-0 w-full">
          <p className={`font-semibold text-text ${compact ? "truncate text-sm" : "line-clamp-2 text-sm"}`}>
            {demo.name}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-text-2">{demo.hostname}</p>
          {!compact && demo.description && (
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-text-2">{demo.description}</p>
          )}
        </div>
      </a>

      {hasFeatures && (
        <div className="mt-2 w-full">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            className="flex items-center gap-1 rounded-md text-[11.5px] font-semibold text-text-3 hover:text-text"
          >
            <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`} />
            Key features
          </button>
          {expanded && (
            <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-text-2">
              {demo.keyFeatures!.map((feature, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-text-3">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
