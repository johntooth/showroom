import { useEffect, useState } from "react"
import type { DeploymentConfig } from "../types"

/**
 * Reads /config.json, a static file served alongside the build. Ops can edit
 * or volume-mount over it at deploy time to change the banner without a
 * rebuild and without any in-app login — the whole app is auth-free.
 */
export function useDeploymentConfig() {
  const [config, setConfig] = useState<DeploymentConfig>({})

  useEffect(() => {
    let cancelled = false
    fetch("/config.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (!cancelled) setConfig(data ?? {})
      })
      .catch(() => {
        if (!cancelled) setConfig({})
      })
    return () => {
      cancelled = true
    }
  }, [])

  return config
}
