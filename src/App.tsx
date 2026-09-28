import { useEffect, useMemo, useRef, useState } from "react"
import { Sidebar, type SidebarView } from "./components/Sidebar"
import { Header } from "./components/Header"
import { TileGrid } from "./components/TileGrid"
import { EmptyState } from "./components/EmptyState"
import { DemoModal } from "./components/DemoModal"
import { SettingsModal } from "./components/SettingsModal"
import { Banner } from "./components/Banner"
import { Toast } from "./components/Toast"
import { useDemos } from "./hooks/useDemos"
import { useSidebar } from "./hooks/useSidebar"
import { useTheme } from "./hooks/useTheme"
import { useBranding } from "./hooks/useBranding"
import { useDeploymentConfig } from "./hooks/useDeploymentConfig"
import { STORAGE_KEYS, readStorage, writeStorage } from "./lib/storage"
import type { Demo, ViewMode } from "./types"

const UNDO_TIMEOUT_MS = 5000

export default function App() {
  const { demos, addDemo, updateDemo, removeDemo, restoreDemo, reorderDemo } = useDemos()
  const sidebar = useSidebar()
  const { theme, toggle: toggleTheme } = useTheme()
  const { branding, updateBranding, resetBranding, saveError } = useBranding()
  const deploymentConfig = useDeploymentConfig()

  const [view, setView] = useState<SidebarView>("all")
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    readStorage<ViewMode>(STORAGE_KEYS.viewMode, "grid") === "list" ? "list" : "grid",
  )
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInitialUrl, setModalInitialUrl] = useState("")
  const [editingDemo, setEditingDemo] = useState<Demo | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [undo, setUndo] = useState<{ demo: Demo; index: number } | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    writeStorage(STORAGE_KEYS.viewMode, viewMode)
  }, [viewMode])

  const visibleDemos = useMemo(() => {
    let list = demos
    if (view === "recent") {
      list = [...list].sort((a, b) => b.createdAt - a.createdAt)
    }
    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.hostname.toLowerCase().includes(query) ||
          (d.description?.toLowerCase().includes(query) ?? false),
      )
    }
    return list
  }, [demos, view, search])

  function openAddModal(initialUrl = "") {
    setModalInitialUrl(initialUrl)
    setEditingDemo(null)
    setModalOpen(true)
  }

  function openEditModal(demo: Demo) {
    setEditingDemo(demo)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingDemo(null)
  }

  function handleSubmitDemo(url: string, name: string, description?: string, keyFeatures?: string[]) {
    if (editingDemo) {
      if (updateDemo(editingDemo.id, url, name, description, keyFeatures)) closeModal()
      return
    }

    const demo = addDemo(url, name, description, keyFeatures)
    if (demo) {
      closeModal()
      requestAnimationFrame(() => {
        document.getElementById(`tile-${demo.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      })
    }
  }

  function handleRemove(id: string) {
    const result = removeDemo(id)
    if (!result) return
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndo(result)
    undoTimerRef.current = setTimeout(() => setUndo(null), UNDO_TIMEOUT_MS)
  }

  function handleUndo() {
    if (!undo) return
    restoreDemo(undo.demo, undo.index)
    setUndo(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      if (e.key === "Escape") {
        if (modalOpen) closeModal()
        else if (settingsOpen) setSettingsOpen(false)
        else if (search) setSearch("")
        return
      }
      if (isTyping || modalOpen || settingsOpen) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === "/") {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === "[") {
        e.preventDefault()
        sidebar.toggle()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [modalOpen, settingsOpen, search, sidebar])

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      const text = e.clipboardData?.getData("text")?.trim()
      if (!text || !/^https?:\/\//i.test(text)) return
      if (!modalOpen && !settingsOpen) openAddModal(text)
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [modalOpen, settingsOpen])

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        collapsed={sidebar.collapsed}
        mobileOpen={sidebar.mobileOpen}
        onCloseMobile={() => sidebar.setMobileOpen(false)}
        onToggle={sidebar.toggle}
        demoCount={demos.length}
        activeView={view}
        onSelectView={setView}
        onAdd={() => openAddModal()}
        theme={theme}
        onToggleTheme={toggleTheme}
        logo={branding.logo}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="min-w-0 flex-1">
        {deploymentConfig.bannerMessage && <Banner message={deploymentConfig.bannerMessage} />}
        <Header
          ref={searchInputRef}
          title={view === "recent" ? "Recent" : "Demo Showroom"}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenMobileSidebar={() => sidebar.setMobileOpen(true)}
        />

        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
          {demos.length === 0 ? (
            <EmptyState onAdd={() => openAddModal()} />
          ) : (
            <TileGrid
              demos={visibleDemos}
              theme={theme}
              viewMode={viewMode}
              reorderable={view === "all"}
              onRemove={handleRemove}
              onEdit={openEditModal}
              onReorder={reorderDemo}
            />
          )}
        </div>
      </main>

      {modalOpen && (
        <DemoModal
          demo={editingDemo ?? undefined}
          initialUrl={modalInitialUrl}
          onClose={closeModal}
          onSubmit={handleSubmitDemo}
        />
      )}

      {undo && (
        <Toast message="Demo removed" actionLabel="Undo" onAction={handleUndo} />
      )}

      {settingsOpen && (
        <SettingsModal
          branding={branding}
          onUpdate={updateBranding}
          onReset={resetBranding}
          onClose={() => setSettingsOpen(false)}
          saveError={saveError}
        />
      )}
    </div>
  )
}
