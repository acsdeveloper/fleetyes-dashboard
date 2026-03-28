/**
 * Vehicles API — /int/v1/vehicles
 */
import { ontrackFetch, buildQueryString } from "./ontrack-api"

export interface Vehicle {
  uuid: string
  public_id: string
  plate_number: string
  make?: string
  model?: string
  year?: string | number
  status?: string
  colour?: string
  color?: string          // API may use either spelling
  vin?: string
  driver_name?: string
  driver_uuid?: string
  photo_url?: string
}

export interface VehicleListResponse {
  vehicles: Vehicle[]
  meta?: { total: number; per_page: number; current_page: number; last_page: number }
}

export async function listVehicles(params: {
  query?: string
  sort?: string
  limit?: number
} = {}): Promise<VehicleListResponse> {
  const merged = { limit: 500, sort: "created_at", ...params }
  const qs = buildQueryString(merged as Record<string, string | number | boolean | undefined | null>)
  return ontrackFetch<VehicleListResponse>(`/vehicles${qs}`)
}

export async function deleteVehicle(uuid: string): Promise<void> {
  return ontrackFetch<void>(`/vehicles/${uuid}`, { method: "DELETE" })
}

export async function bulkDeleteVehicles(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
  const results = await Promise.allSettled(uuids.map(id => deleteVehicle(id)))
  const errors = results
    .map((r, i) => r.status === "rejected" ? `${uuids[i]}: ${(r.reason as Error)?.message ?? "failed"}` : null)
    .filter(Boolean) as string[]
  return { deleted: results.filter(r => r.status === "fulfilled").length, errors }
}
