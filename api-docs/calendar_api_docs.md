# Calendar / Scheduler API Documentation

> **Base URL:** `{{url}}/int/v1/orders`
> **Auth:** All endpoints require a valid session cookie / authenticated user.

---

## Overview

The Scheduler (Calendar) page uses a **single API endpoint** to fetch all orders. There is no separate API for "scheduled" vs "unscheduled" orders. The differentiation is done **on the frontend** after the data is fetched, based on the `driver_assigned_uuid` field.

---

## Scheduled vs Unscheduled — Frontend Classification

| Condition | Classification |
|---|---|
| `driver_assigned_uuid` has a value | **Scheduled Order** |
| `driver_assigned_uuid` is `null` / empty | **Unscheduled Order** |

> An order is also considered **unscheduled** only when both `driver_assigned_uuid` **and** `vehicle_assigned_uuid` are null/empty.

---

## API Calls Made by the Scheduler Page

The scheduler page makes **two separate calls** to the same endpoint for different purposes:

### 1. Sidebar Panel Orders (Paginated)

**`GET /int/v1/orders`**

Used to populate the left-side **Scheduled Orders** and **Unscheduled Orders** panels.

#### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `with[]` | array | — | Eager load relations: `payload`, `driverAssigned.vehicle`, `fleet` |
| `limit` | integer | `30` | Items per page |
| `page` | integer | `1` | Page number |
| `sort` | string | `-created_at` | Sort order |

#### Example Request

```
GET {{url}}/int/v1/orders?with[]=payload&with[]=driverAssigned.vehicle&with[]=fleet&limit=30&page=1&sort=-created_at
```

---

### 2. Calendar View Orders (Batched)

**`GET /int/v1/orders`**

Used to populate the **full calendar** with order events. Fetches up to 500 orders in batches of 100 with minimal fields for performance.

#### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `with[]` | array | — | Eager load: `driverAssigned`, `fleet` |
| `fields` | string | — | Comma-separated minimal fields: `id,driver_assigned_uuid,public_id,scheduled_at,scheduled_end,status` |
| `filter[deleted_at]` | null | — | Exclude soft-deleted records |
| `limit` | integer | `100` | Batch size (max per request) |
| `page` | integer | `1` | Page number (loops until all fetched, max 500 total) |
| `sort` | string | `-created_at` | Sort order |

#### Example Request

```
GET {{url}}/int/v1/orders?with[]=driverAssigned&with[]=fleet&fields=id,driver_assigned_uuid,public_id,scheduled_at,scheduled_end,status&filter[deleted_at]=&limit=100&page=1&sort=-created_at
```

---

## Supported Query Filters

| Param | Type | Description |
|---|---|---|
| `filter[status]` | string | Filter by order status (e.g. `created`, `dispatched`, `completed`) |
| `filter[driver_assigned_uuid]` | UUID | Filter orders assigned to a specific driver |
| `filter[scheduled_at]` | date | Filter orders scheduled on or after this date |
| `filter[end_date]` | date | Filter orders scheduled on or before this date |
| `filter[unassigned]` | boolean | `true` returns orders with no driver assigned and not completed/canceled |
| `filter[active]` | boolean | `true` returns orders that have a driver and are in an active status |

---

## Key Order Fields (Calendar-Relevant)

| Field | Type | Description |
|---|---|---|
| `driver_assigned_uuid` | UUID / null | FK to driver. **Non-null = Scheduled. Null = Unscheduled.** |
| `vehicle_assigned_uuid` | UUID / null | FK to vehicle. Used in combination with driver to confirm unscheduled state. |
| `scheduled_at` | datetime / null | When the order is scheduled to start. Used for calendar event positioning. |
| `estimated_end_date` | datetime / null | Expected completion time. Used for calendar event end position. |
| `status` | string | Current order status (`created`, `dispatched`, `in_progress`, `completed`, etc.) |

---

## Example Response (Single Order)

```json
{
  "id": "order_abc123",
  "public_id": "ORD-0001",
  "status": "dispatched",
  "scheduled_at": "2026-03-27T09:00:00Z",
  "estimated_end_date": "2026-03-27T11:00:00Z",
  "driver_assigned_uuid": "drv_xyz789",
  "vehicle_assigned_uuid": "veh_abc456",
  "driverAssigned": {
    "id": "drv_xyz789",
    "name": "John Doe",
    "vehicle": { ... }
  },
  "fleet": { ... }
}
```

---

## Update Order Assignment (Calendar Drag / Save)

**`PUT /int/v1/orders/{uuid}`**

Used when saving an order's driver, fleet, and vehicle assignment from the scheduler/calendar page (via the schedule card form).

#### Example Request

```
PUT https://api.fleetyes.com/int/v1/orders/be3f5f30-9cd9-41e9-8863-884da08efdfc
```

#### Request Body

```json
{
  "driver_assigned_uuid": "drv_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "vehicle_assigned_uuid": "veh_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "fleet_uuid": "flt_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "scheduled_at": "2026-03-27T09:00:00.000Z",
  "estimated_end_date": "2026-03-27T17:00:00.000Z",
  "has_driver_assigned": true
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `driver_assigned_uuid` | UUID | Yes | UUID of the driver being assigned |
| `vehicle_assigned_uuid` | UUID | Yes | UUID of the vehicle being assigned |
| `fleet_uuid` | UUID | Yes | UUID of the fleet the order belongs to |
| `scheduled_at` | datetime | Yes | Order start datetime (ISO 8601) |
| `estimated_end_date` | datetime | No | Expected order end datetime (ISO 8601) |
| `has_driver_assigned` | boolean | No | Set to `true` when driver is assigned |

#### Validation Rules

- `fleet_uuid` is required before saving
- `scheduled_at` is required before saving
- Driver and vehicle must **both** be assigned or **both** be null — partial assignment is not allowed
- If the selected driver or vehicle is already assigned to another order in the same time window, a warning is shown but save is still permitted

#### Response

Returns the updated order object on success (`200 OK`).

#### After Save

On successful save the calendar automatically refreshes to reflect the updated assignment.

---

## Leave Requests / Unavailability (Calendar Overlay)

The calendar fetches approved leave requests to display driver and vehicle unavailability as overlays. Two calls are made in parallel on page load.

---

### 1. Driver Leave Requests

**`GET /api/v1/leave-requests/list`**

Returns approved driver leave/holiday requests displayed as unavailability blocks on the calendar.

#### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | Always `Approved` — only approved leaves are shown on the calendar |
| `timestamp` | number | Yes | Current Unix timestamp in ms (cache-busting) |

#### Example Request

```
GET https://api.fleetyes.com/api/v1/leave-requests/list?timestamp=1774519888094&status=Approved
```

---

### 2. Vehicle Maintenance / Unavailability

**`GET /api/v1/leave-requests/list`**

Returns approved vehicle maintenance/unavailability records displayed on the calendar.

#### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | Always `Approved` |
| `unavailability_type` | string | Yes | `vehicle` — filters to vehicle-type unavailability records |
| `timestamp` | number | Yes | Current Unix timestamp in ms (cache-busting) |

#### Example Request

```
GET https://api.fleetyes.com/api/v1/leave-requests/list?timestamp=1774519888094&status=Approved&unavailability_type=vehicle
```

---

### Response Format

Both calls return the same structure:

```json
{
  "data": [
    {
      "id": "lr_xxxxxxxx",
      "public_id": "LR-0001",
      "user_uuid": "usr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "vehicle_uuid": "veh_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "vehicle_name": "Van - AB12 CDE",
      "start_date": "2026-03-27",
      "end_date": "2026-03-28",
      "reason": "Annual leave",
      "unavailability_type": "vehicle",
      "created_at": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `user_uuid` | UUID / null | Driver the leave belongs to (null for vehicle records) |
| `vehicle_uuid` | UUID / null | Vehicle the unavailability belongs to (null for driver records) |
| `vehicle_name` | string | Human-readable vehicle label |
| `start_date` | date | Unavailability start date (`YYYY-MM-DD`) |
| `end_date` | date | Unavailability end date (`YYYY-MM-DD`) |
| `reason` | string | Reason for leave/unavailability |
| `unavailability_type` | string | `vehicle` for maintenance records; absent/null for driver leaves |

### Notes

- Both calls are made **in parallel** on calendar page load
- Results are **merged** into a single unavailability list used to block out calendar slots
- The `timestamp` param is used for **cache-busting** only — it has no effect on filtering
- Auth header: `Authorization: Bearer {token}` (token read from `ember_simple_auth-session` in localStorage)

---

## Dropdown APIs

The scheduler page uses three additional APIs to populate filter dropdowns.

---

### 1. Order Statuses Dropdown

**`GET /int/v1/orders/statuses`**

Returns all available order status values for the status filter dropdown.

#### Example Request

```
GET https://api.fleetyes.com/int/v1/orders/statuses
```

---

### 2. Drivers Dropdown

**`GET /int/v1/drivers`**

Returns a list of drivers for the driver filter dropdown.

#### Example Request

```
GET https://api.fleetyes.com/int/v1/drivers
```

---

### 3. Vehicles Dropdown

**`GET /int/v1/vehicles`**

Returns a list of vehicles for the vehicle filter dropdown.

#### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | `500` | Max number of vehicles to return |

#### Example Request

```
GET https://api.fleetyes.com/int/v1/vehicles?limit=500
```

---

## Notes

- The backend supports `unassigned` and `active` filters via `OrderFilter`, but the scheduler page **does not send these filters** — it fetches all orders and classifies them client-side.
- Calendar event start/end positions are determined by `scheduled_at` and `estimated_end_date`.
- The sidebar panels support independent pagination via `page` and `limit` query parameters.
