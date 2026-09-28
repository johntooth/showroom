import { Diamond, Grid2x2, History, Moon, Plus, Settings, Sun, ChevronLeft, ChevronRight } from "lucide-react"
import type { Theme } from "../types"

export type SidebarView = "all" | "recent"

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggle: () => void
  demoCount: number
  activeView: SidebarView
  onSelectView: (view: SidebarView) => void
  onAdd: () => void
  theme: Theme
  onToggleTheme: () => void
  logo?: string
  onOpenSettings: () => void
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggle,
  demoCount,
  activeView,
  onSelectView,
  onAdd,
  theme,
  onToggleTheme,
  logo,
  onOpenSettings,
}: SidebarProps) {
  // On mobile the sidebar is an overlay drawer, so any choice made in it should
  // also dismiss it. Harmless on larger screens, where it is never open.
  const andClose = (action: () => void) => () => {
    action()
    onCloseMobile()
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-y-auto border-r border-border bg-surface-2 transition-all duration-200 md:sticky md:h-screen md:self-start md:translate-x-0 ${
          collapsed ? "w-16" : "w-60"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 px-4">
          {logo ? (
            <img src={logo} alt="" className="h-5 w-5 shrink-0 rounded object-contain" />
          ) : (
            <Diamond className="h-4 w-4 shrink-0 text-accent" />
          )}
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-text">
              Demo Showroom
            </span>
          )}
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={andClose(onAdd)}
            title="Add demo"
            className={`flex h-10 w-full items-center gap-2 rounded-[10px] bg-accent text-[13.5px] font-semibold text-accent-text transition-opacity hover:opacity-90 ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Add demo</span>}
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          <NavItem
            icon={<Grid2x2 className="h-4 w-4 shrink-0" />}
            label="All demos"
            count={demoCount}
            collapsed={collapsed}
            active={activeView === "all"}
            onClick={andClose(() => onSelectView("all"))}
          />
          <NavItem
            icon={<History className="h-4 w-4 shrink-0" />}
            label="Recent"
            collapsed={collapsed}
            active={activeView === "recent"}
            onClick={andClose(() => onSelectView("recent"))}
          />
        </nav>

        <div className="mx-3 my-4 border-t border-border" />

        <nav className="flex flex-col gap-1 px-3">
          <NavItem
            icon={<Settings className="h-4 w-4 shrink-0" />}
            label="Settings"
            collapsed={collapsed}
            active={false}
            onClick={andClose(onOpenSettings)}
          />
          <NavItem
            icon={
              theme === "dark" ? (
                <Moon className="h-4 w-4 shrink-0" />
              ) : (
                <Sun className="h-4 w-4 shrink-0" />
              )
            }
            label="Theme"
            collapsed={collapsed}
            active={false}
            onClick={onToggleTheme}
          />
        </nav>

        <div className="mt-auto hidden justify-end px-3 py-3 md:flex">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-1.5 text-text-3 hover:bg-white/5 hover:text-text"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  count?: number
  collapsed: boolean
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, count, collapsed, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={`flex h-10 items-center gap-2.5 rounded-[10px] text-[14px] transition-colors ${
        collapsed ? "justify-center px-0" : "px-2.5"
      } ${
        active
          ? "bg-accent/15 font-semibold text-accent"
          : "font-medium text-text-2 hover:bg-white/5 hover:text-text"
      }`}
    >
      {icon}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          {typeof count === "number" && <span className="text-xs text-text-3">{count}</span>}
        </>
      )}
    </button>
  )
}
