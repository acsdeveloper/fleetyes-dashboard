/**
 * Drivers API — /int/v1/drivers
 * Lightweight client for the driver list — used for dropdowns/assignment.
 */

import { ontrackFetch, buildQueryString } from "./ontrack-api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type DriverStatus = "active" | "inactive"

export interface Driver {
  id?: string
  uuid: string
  public_id: string
  internal_id?: string
  name: string
  email?: string
  phone?: string
  country?: string
  city?: string
  drivers_license_number?: string
  vehicle_uuid?: string
  fleet_uuid?: string[]
  status: DriverStatus
  priority?: number
}

export interface DriverListParams {
  page?: number
  limit?: number
  sort?: string
  query?: string
  name?: string
  status?: DriverStatus
  fleet?: string
  vehicle?: string
}

export interface DriverListResponse {
  drivers: Driver[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listDrivers(
  params: DriverListParams = {}
): Promise<DriverListResponse> {
  const defaults: DriverListParams = { limit: 500, sort: "name" }
  const merged = { ...defaults, ...params }
  const qs = buildQueryString(merged as Record<string, string | number | boolean | undefined | null>)
  return ontrackFetch<DriverListResponse>(`/drivers${qs}`)
}
