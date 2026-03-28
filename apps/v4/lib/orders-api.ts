/**
 * Orders API — /int/v1/orders
 * Uses the shared ontrackFetch helper from ontrack-api.ts
 */

import { ontrackFetch, buildQueryString, PaginationMeta } from "./ontrack-api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "created"
  | "dispatched"
  | "started"
  | "completed"
  | "canceled"

export interface OrderPayload {
  id?: string
  pickup?:      { uuid: string; public_id?: string; name: string; address: string } | null
  dropoff?:     { uuid: string; public_id?: string; name: string; address: string } | null
  return?:      null
  waypoints?:   unknown[]
  pickup_name?:  string   // appended by Fleetbase API
  dropoff_name?: string   // appended by Fleetbase API
}

export interface OrderDriver {
  uuid: string
  public_id?: string
  name: string
  phone?: string
}

export interface OrderVehicle {
  uuid: string
  public_id?: string
  plate_number?: string
}

export interface OrderTrackingNumber {
  uuid: string
  tracking_number: string
}

export interface Order {
  id: string
  uuid: string
  public_id: string
  internal_id?: string
  status: OrderStatus
  type?: string
  dispatched: boolean
  dispatched_at?: string | null
  started: boolean
  started_at?: string | null
  scheduled_at?: string | null
  estimated_end_date?: string | null
  distance?: number
  time?: number
  notes?: string
  pod_required?: boolean
  pod_method?: "signature" | "photo" | "qr_scan"
  adhoc?: boolean
  fleet_uuid?: string
  fleet_name?: string
  trip_id?: string
  trip_hash_id?: string
  driver_assigned_uuid?: string
  vehicle_assigned_uuid?: string
  driver_name?: string
  customer_name?: string
  facilitator_name?: string
  pickup_name?: string
  dropoff_name?: string
  created_by_name?: string
  updated_by_name?: string
  payload?: OrderPayload
  driver_assigned?: OrderDriver | null
  vehicle_assigned?: OrderVehicle | null
  tracking_number?: OrderTrackingNumber | null
  created_at: string
  updated_at: string
}

export interface OrderListParams {
  page?: number
  per_page?: number
  sort?: string
  query?: string
  status?: OrderStatus | OrderStatus[]
  unassigned?: boolean
  active?: boolean
  dispatched?: boolean
  started?: boolean
  fleet?: string
  driver?: string
  vehicle?: string
  on?: string
  timezone?: string
  scheduled_at?: string
  end_date?: string
}

export interface OrderListResponse {
  orders: Order[]
  meta: PaginationMeta
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
  const { status, ...rest } = params

  // status can be array → repeat param
  const statusParams =
    Array.isArray(status) && status.length > 1
      ? status.map((s) => `status[]=${encodeURIComponent(s)}`).join("&")
      : status
      ? `status=${encodeURIComponent(status as string)}`
      : ""

  const qs = buildQueryString(rest as Record<string, string | number | boolean | undefined | null>)
  const separator = qs && statusParams ? "&" : ""
  const fullQs = qs + separator + statusParams

  return ontrackFetch<OrderListResponse>(`/orders${fullQs || ""}`)
}

export async function getOrder(id: string): Promise<{ order: Order }> {
  return ontrackFetch<{ order: Order }>(`/orders/${id}`)
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
