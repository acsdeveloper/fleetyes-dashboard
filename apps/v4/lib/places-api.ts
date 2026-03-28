/**
 * Places API — /int/v1/places
 */
import { ontrackFetch, buildQueryString } from "./ontrack-api"

export interface Place {
  uuid: string
  public_id: string
  name: string
  code?: string
  address?: string
  city?: string
  country?: string
  postal_code?: string
  /** GeoJSON point returned by the API, e.g. { type: 'Point', coordinates: [lng, lat] } */
  location?: {
    type: string
    coordinates: [number, number]  // [longitude, latitude]
  } | null
  /** Sometimes returned as top-level fields */
  latitude?: number | null
  longitude?: number | null
}

export interface PlaceListResponse {
  places: Place[]
  meta?: { total: number; per_page: number; current_page: number; last_page: number }
}

export async function listPlaces(params: {
  query?: string
  limit?: number
  sort?: string
} = {}): Promise<PlaceListResponse> {
  const merged = { limit: 500, sort: "name", ...params }
  const qs = buildQueryString(merged as Record<string, string | number | boolean | undefined | null>)
  return ontrackFetch<PlaceListResponse>(`/places${qs}`)
}

export async function deletePlace(uuid: string): Promise<void> {
  return ontrackFetch<void>(`/places/${uuid}`, { method: "DELETE" })
}

export async function bulkDeletePlaces(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
  const results = await Promise.allSettled(uuids.map(id => deletePlace(id)))
  const errors = results
    .map((r, i) => r.status === "rejected" ? `${uuids[i]}: ${r.reason?.message ?? "failed"}` : null)
    .filter(Boolean) as string[]
  return { deleted: results.filter(r => r.status === "fulfilled").length, errors }
}
