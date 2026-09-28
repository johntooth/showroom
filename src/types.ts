export interface Demo {
  id: string
  url: string
  name: string
  hostname: string
  description?: string
  keyFeatures?: string[]
  createdAt: number
}

export type ViewMode = "grid" | "list"
export type Theme = "dark" | "light"

export interface Branding {
  logo?: string
  favicon?: string
  accentColor?: string
}

export interface DeploymentConfig {
  bannerMessage?: string
}
