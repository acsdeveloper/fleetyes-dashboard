/**
 * Orders API
 *
 * LIST / VIEW  →  /int/v1/orders/list   (new endpoint, per API docs)
 * MUTATIONS    →  /int/v1/orders        (legacy endpoint, unchanged)
 *
 * Uses the shared ontrackFetch helper from ontrack-api.ts.
 */

import { ontrackFetch, buildQueryString } from "./ontrack-api"
import type { PaginationMeta } from "./ontrack-api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "created"
  | "dispatched"
  | "started"
  | "completed"
  | "canceled"

/** Full place details as returned by the new /orders/list endpoint */
export interface OrderPlace {
  uuid: string
  public_id?: string
  name?: string | null
  street1?: string | null
  street2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  neighborhood?: string | null
  country?: string | null
  phone?: string | null
  type?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface OrderPayload {
  uuid?: string
  pickup?:    OrderPlace | null
  dropoff?:   OrderPlace | null
  return?:    null
  waypoints?: Array<{ uuid: string; place_uuid?: string | null; place?: { uuid: string; name?: string } | null }>
}

/** Driver relation — new API returns only { uuid, name } */
export interface OrderDriver {
  uuid: string
  name: string
  // Legacy fields — may still be present from old endpoint usage
  public_id?: string
  phone?: string
}

/**
 * Vehicle relation — new API returns { uuid, name } where name is a computed
 * string like "2022 Toyota Hilux AB12 CDE" (includes plate at the end).
 * API developer will add plate_number in a future update.
 */
export interface OrderVehicle {
  uuid: string
  name?: string          // computed: "Year Make Model Plate"
  // Legacy fields — may still be present from old endpoint
  public_id?: string
  plate_number?: string
}

export interface OrderRelation {
  uuid: string
  name: string
}

export interface OrderRouteSegment {
  uuid: string
  facility_sequence?: number | null
  shipper_accounts?: string | null
}

export interface Order {
  uuid: string
  public_id: string
  internal_id?: string | null
  type?: string | null
  status: OrderStatus
  dispatched: boolean
  dispatched_at?: string | null
  // 'started' not returned by new list API — derive from status === 'started' if needed
  started_at?: string | null
  scheduled_at?: string | null
  estimated_end_date?: string | null
  distance?: number | null
  time?: number | null
  trip_id?: string | null
  trip_hash_id?: string | null
  fleet_uuid?: string | null
  carrier?: string | null
  driver_assigned_uuid?: string | null
  vehicle_assigned_uuid?: string | null
  payload_uuid?: string | null
  fleet?: OrderRelation | null
  driver_assigned?: OrderDriver | null
  vehicle_assigned?: OrderVehicle | null
  customer?: OrderRelation | null
  facilitator?: OrderRelation | null
  route_segments?: OrderRouteSegment[]
  payload?: OrderPayload | null
  created_at: string
  updated_at: string
  // ── Legacy fields — still present on old /orders endpoint responses (used in mutations) ──
  id?: string
  notes?: string
  pod_required?: boolean
  pod_method?: "signature" | "photo" | "qr_scan"
  adhoc?: boolean
  fleet_name?: string
  driver_name?: string
  customer_name?: string
  facilitator_name?: string
  pickup_name?: string
  dropoff_name?: string
  created_by_name?: string
  updated_by_name?: string
  tracking_number?: { uuid: string; tracking_number: string } | null
}

// ─── OrderListParams — new /orders/list endpoint ──────────────────────────────

export interface OrderListParams {
  /** Alias for limit — internally converted to `limit` for the new endpoint */
  per_page?: number
  limit?: number
  page?: number
  /** If true, returns all records without pagination */
  all?: boolean
  /** Sort: column:direction e.g. "created_at:desc" or "scheduled_at:asc" */
  sort?: string
  query?: string
  status?: OrderStatus | OrderStatus[] | string
  driver?: string
  fleet?: string
  pickup?: string
  dropoff?: string
  /** Single-day overlap filter on scheduled_at / estimated_end_date */
  on?: string
  timezone?: string
  /** Range filter: orders with scheduled_at >= this date */
  scheduled_at?: string
  /** Range filter: orders with estimated_end_date <= this date */
  end_date?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  public_id?: string
  trip_id?: string
  vehicle?: string
}

export interface OrderListResponse {
  /** Orders returned by the new /orders/list endpoint */
  data: Order[]
  meta: PaginationMeta
}

// ─── Compatibility helpers ─────────────────────────────────────────────────────
// Use these instead of accessing .driver_name, .pickup_name etc. directly.
// They work with both the new list API shape and old mutation response shape.

/** Best available driver name from an order */
export function orderDriverName(o: Order): string | null {
  return o.driver_assigned?.name ?? o.driver_name ?? null
}

/**
 * Vehicle display string.
 * New API: vehicle_assigned.name = computed "Year Make Model Plate"
 * Old API: vehicle_assigned.plate_number
 */
export function orderVehicleDisplay(o: Order): string | null {
  return o.vehicle_assigned?.name ?? o.vehicle_assigned?.plate_number ?? null
}

/** Best available pickup place name */
export function orderPickupName(o: Order): string | null {
  return o.payload?.pickup?.name ?? o.pickup_name ?? null
}

/** Best available dropoff place name */
export function orderDropoffName(o: Order): string | null {
  return o.payload?.dropoff?.name ?? o.dropoff_name ?? null
}

/** Fleet display name */
export function orderFleetName(o: Order): string | null {
  return o.fleet?.name ?? o.fleet_name ?? null
}

/** Customer display name */
export function orderCustomerName(o: Order): string | null {
  return o.customer?.name ?? o.customer_name ?? null
}

/** Whether order is started (derived from status when boolean not available) */
export function orderIsStarted(o: Order): boolean {
  return o.status === "started"
}

export interface CreateOrderPayload {
  status?: OrderStatus
  type?: string
  internal_id?: string
  notes?: string
  pod_required?: boolean
  pod_method?: "signature" | "photo" | "qr_scan"
  adhoc?: boolean
  adhoc_distance?: number | null
  dispatched?: boolean
  scheduled_at?: string | null
  estimated_end_date?: string | null
  fleet_uuid?: string | null
  driver_assigned_uuid?: string | null
  vehicle_assigned_uuid?: string | null
  customer_uuid?: string | null
  customer_type?: "contact" | "vendor"
  facilitator_uuid?: string | null
  facilitator_type?: "contact" | "vendor"
  payload?: {
    pickup_uuid?: string | null
    dropoff_uuid?: string | null
    return_uuid?: string | null
    waypoints?: unknown[]
    entities?: unknown[]
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listOrders(params: OrderListParams = {}): Promise<OrderListResponse> {
  const { status, per_page, limit, sort, ...rest } = params

  // Resolve limit: prefer explicit `limit`, fall back to `per_page` for backward compat
  const resolvedLimit = limit ?? per_page

  // New sort format: "column:direction" (e.g. "created_at:desc")
  // Accept legacy "-column" prefix format and convert, or pass through if already new format
  let resolvedSort = sort
  if (sort && sort.startsWith("-")) {
    resolvedSort = `${sort.slice(1)}:desc`
  }

  // Status: single value or comma-separated string
  let statusParam = ""
  if (Array.isArray(status) && status.length > 0) {
    statusParam = status.join(",")
  } else if (typeof status === "string" && status) {
    statusParam = status
  }

  const qs = buildQueryString({
    ...(rest as Record<string, string | number | boolean | undefined | null>),
    ...(resolvedLimit  ? { limit: resolvedLimit } : {}),
    ...(resolvedSort   ? { sort: resolvedSort }   : {}),
    ...(statusParam    ? { status: statusParam }   : {}),
  })

  return ontrackFetch<OrderListResponse>(`/orders/list${qs || ""}`)
}

export async function getOrder(id: string): Promise<{ data: Order }> {
  return ontrackFetch<{ data: Order }>(`/orders/list/${id}`)
}


export async function createOrder(data: CreateOrderPayload): Promise<{ order: Order }> {
  return ontrackFetch<{ order: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify({ order: data }),
  })
}

export async function updateOrder(
  id: string,
  data: Partial<CreateOrderPayload>
): Promise<{ order: Order }> {
  return ontrackFetch<{ order: Order }>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ order: data }),
  })
}

export async function deleteOrder(id: string): Promise<{ status: string; message: string }> {
  return ontrackFetch<{ status: string; message: string }>(`/orders/${id}`, {
    method: "DELETE",
  })
}

export async function dispatchOrder(uuid: string): Promise<{ status: string; order: Partial<Order> }> {
  return ontrackFetch<{ status: string; order: Partial<Order> }>("/orders/dispatch", {
    method: "PATCH",
    body: JSON.stringify({ uuid }),
  })
}

// ─── Allocation Period ─────────────────────────────────────────────────────────

export interface AllocationPeriod {
  /** Normalised to "YYYY-MM-DD" */
  start_date: string
  /** Normalised to "YYYY-MM-DD" */
  end_date: string
}

/**
 * Parse a date string in either known API format and return "YYYY-MM-DD".
 *   "2026-04-13"            → "2026-04-13"
 *   "04/12/2026  00:30:00"  → "2026-04-12"
 */
function normaliseDate(raw: string): string {
  const s = raw.trim()
  // Already YYYY-MM-DD (or starts with it)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  // MM/DD/YYYY … (with optional time component)
  const parts = s.split(/[\s/]+/).filter(Boolean)
  if (parts.length >= 3) {
    const [mm, dd, yyyy] = parts
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`
  }
  // Fallback: return first 10 chars and hope for the best
  return s.slice(0, 10)
}

/**
 * Fetch the current allocation period from GET /get-period.
 * Both date strings are normalised to "YYYY-MM-DD" before returning.
 * Throws on network / API error — callers should handle with a fallback.
 */
export async function getPeriod(): Promise<AllocationPeriod> {
  const raw = await ontrackFetch<{ start_date: string; end_date: string }>("/get-period")
  return {
    start_date: normaliseDate(raw.start_date),
    end_date:   normaliseDate(raw.end_date),
  }
}
