import { useState } from "react"
import type { Demo, Theme, ViewMode } from "../types"
import { Tile } from "./Tile"

interface TileGridProps {
  demos: Demo[]
  theme: Theme
  viewMode: ViewMode
  /** False when the order on screen isn't the stored order (e.g. sorted by recency). */
  reorderable: boolean
  onRemove: (id: string) => void
  onEdit: (demo: Demo) => void
  onReorder: (draggedId: string, targetId: string) => void
}

export function TileGrid({ demos, theme, viewMode, reorderable, onRemove, onEdit, onReorder }: TileGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-[repeat(auto-fill,minmax(208px,1fr))] gap-4"
          : "flex max-w-xl flex-col gap-2"
      }
    >
      {demos.map((demo) => (
        <Tile
          key={demo.id}
          demo={demo}
          theme={theme}
          compact={viewMode === "list"}
          reorderable={reorderable}
          isDragging={draggingId === demo.id}
          isDragOver={dragOverId === demo.id && draggingId !== demo.id}
          onRemove={onRemove}
          onEdit={onEdit}
          onDragStart={setDraggingId}
          onDragOver={setDragOverId}
          onDrop={(targetId) => {
            if (draggingId) onReorder(draggingId, targetId)
            setDraggingId(null)
            setDragOverId(null)
          }}
          onDragEnd={() => {
            setDraggingId(null)
            setDragOverId(null)
          }}
        />
      ))}
    </div>
  )
}
