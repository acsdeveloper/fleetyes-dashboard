/**
 * FleetYes — Geotab Integration Settings
 *
 * Credentials are stored in localStorage keyed by company UUID so each
 * organisation can configure their own MyGeotab connection without requiring
 * a platform-wide env variable.
 *
 * When the Ontrack API gains a /company/integrations endpoint this module
 * can be updated to hit that endpoint instead, without changing any UI code.
 */

import { getCompanyUuid } from "@/lib/ontrack-api"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeotabSettings {
  enabled:  boolean
  server:   string   // e.g. "my.geotab.com" or "my3.geotab.com"
  database: string   // company database name in MyGeotab
  userName: string   // service account email
  password: string   // service account password
}

export const GEOTAB_DEFAULTS: GeotabSettings = {
  enabled:  false,
  server:   "my.geotab.com",
  database: "",
  userName: "",
  password: "",
}

// ─── Storage key ─────────────────────────────────────────────────────────────

function lsKey(): string {
  const uuid = getCompanyUuid()
  return uuid ? `fleetyes_geotab_${uuid}` : "fleetyes_geotab_global"
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getGeotabSettings(): GeotabSettings {
  if (typeof window === "undefined") return { ...GEOTAB_DEFAULTS }
  const raw = localStorage.getItem(lsKey())
  if (!raw) return { ...GEOTAB_DEFAULTS }
  try {
    return { ...GEOTAB_DEFAULTS, ...JSON.parse(raw) } as GeotabSettings
  } catch {
    return { ...GEOTAB_DEFAULTS }
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function saveGeotabSettings(settings: GeotabSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(lsKey(), JSON.stringify(settings))
}

// ─── Runtime config helper (used by geotab.ts) ──────────────────────────────

/**
 * Returns the current Geotab config suitable for passing to the API client.
 * Throws if the integration is not enabled or credentials are incomplete.
 */
export function getGeotabConfig(): { server: string; database: string; userName: string; password: string } {
  const s = getGeotabSettings()
  if (!s.enabled) throw new Error("Geotab integration is not enabled. Configure it in Org Settings → Integrations.")
  if (!s.server || !s.database || !s.userName || !s.password) {
    throw new Error("Geotab credentials are incomplete. Check Org Settings → Integrations.")
  }
  return { server: s.server, database: s.database, userName: s.userName, password: s.password }
}
