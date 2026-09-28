import { forwardRef } from "react"
import { LayoutGrid, List, Menu, Search } from "lucide-react"
import type { ViewMode } from "../types"

interface HeaderProps {
  title: string
  search: string
  onSearchChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onOpenMobileSidebar: () => void
}

export const Header = forwardRef<HTMLInputElement, HeaderProps>(function Header(
  { title, search, onSearchChange, viewMode, onViewModeChange, onOpenMobileSidebar },
  searchRef,
) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-2/80 px-4 backdrop-blur md:px-8">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        aria-label="Open sidebar"
        className="rounded-md p-1.5 text-text-2 hover:bg-white/5 hover:text-text md:hidden"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <h1 className="truncate text-[20px] font-semibold tracking-[-0.01em] text-text">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3" />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search demos"
            placeholder="Search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-32 rounded-lg border border-border bg-bg pl-8 pr-3 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent sm:w-40 md:w-56"
          />
        </div>

        <div className="flex items-center rounded-lg border border-border p-0.5">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-accent/15 text-accent" : "text-text-3 hover:text-text"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-accent/15 text-accent" : "text-text-3 hover:text-text"}`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
})
