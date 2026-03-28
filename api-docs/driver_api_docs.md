# Driver Page API Documentation

> **Base URL:** `{{url}}/int/v1/drivers`
> **Auth:** All endpoints require a valid session cookie / authenticated user.

---

## 1. Driver List (Handsontable)

**`GET /int/v1/drivers`**

Fetches the paginated list of drivers displayed in the Handsontable grid.

#### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `300` | Drivers per page |
| `sort` | string | `created_at` | Sort field. Prepend `-` for descending (e.g. `-created_at`) |
| `query` | string | — | Full-text search across name, email, phone, license |
| `name` | string | — | Filter by driver name |
| `public_id` | string | — | Filter by public ID |
| `internal_id` | string | — | Filter by internal ID |
| `drivers_license_number` | string | — | Filter by license number |
| `phone` | string | — | Filter by phone number |
| `country` | string | — | Filter by country code (e.g. `GB`) |
| `status` | string | — | Filter by status (e.g. `active`, `inactive`) |
| `fleet` | UUID | — | Filter by fleet UUID |
| `vehicle` | UUID | — | Filter by assigned vehicle UUID |
| `vendor` | UUID | — | Filter by vendor UUID |
| `priority` | integer | — | Filter by priority value |
| `created_at` | date | — | Filter by creation date |
| `updated_at` | date | — | Filter by last update date |
| `within[latitude]` | float | — | Geo filter: centre latitude |
| `within[longitude]` | float | — | Geo filter: centre longitude |
| `within[radius]` | float | — | Geo filter: radius in km |
| `within[where]` | string | — | Geo filter: named place |

#### Example Request

```
GET {{url}}/int/v1/drivers?limit=300&sort=created_at&page=1
```

---

## 2. Inline Create (New Row in Table)

**`POST /int/v1/drivers`**

Creates a new driver record directly from a new row typed in the Handsontable grid.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+447911123456",
  "country": "GB",
  "city": "London",
  "drivers_license_number": "DOE9901011JD",
  "internal_id": "DRV-001",
  "vehicle_uuid": "veh_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "fleet_uuid": ["flt_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],
  "status": "active",
  "shift_preferences": {
    "all_days": {
      "start": "08:00:00",
      "end": "18:00:00"
    }
  }
}
```

#### Required Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | Minimum required field to trigger create |
| `status` | string | Defaults to `active` if blank |

---

## 3. Inline Edit (Cell Change in Table)

**`PUT /int/v1/drivers/{id}`**

Updates an existing driver when a cell value is changed in the Handsontable grid.

#### Example Request

```
PUT {{url}}/int/v1/drivers/drv_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### Request Body

```json
{
  "id": "drv_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "public_id": "DRV-0001",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+447911123456",
  "country": "GB",
  "city": "London",
  "drivers_license_number": "DOE9901011JD",
  "internal_id": "DRV-001",
  "vehicle_uuid": "veh_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "fleet_uuid": ["flt_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],
  "status": "active",
  "shift_preferences": {
    "all_days": {
      "start": "08:00:00",
      "end": "18:00:00"
    }
  }
}
```

---

## 4. Assign Fleet

**`PUT /int/v1/drivers/{id}`**

Assigns one or more fleets to a driver from the Fleet column multi-select dropdown in the table.

#### Request Body

```json
{
  "fleet_uuid": [
    "flt_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "flt_yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
  ]
}
```

#### Notes

- Passing `adapterOptions: { dropdownfleet: 1 }` is sent internally to indicate this is a fleet dropdown change.
- Removing a fleet from the selection removes the driver from that fleet.

---

## 5. Assign Vehicle

**`PUT /int/v1/drivers/{id}`**

Assigns a vehicle to a driver via the assign vehicle action.

#### Request Body

```json
{
  "vehicle_uuid": "veh_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## 6. Status Update

**`PUT /int/v1/drivers/{id}`**

Updates a driver's status via the Status column in the table.

#### Request Body

```json
{
  "status": "inactive"
}
```

#### Available Status Values

Fetched from: `GET /int/v1/drivers/statuses`

| Value | Description |
|---|---|
| `active` | Driver is active and available |
| `inactive` | Driver is inactive |

---

## 7. Driver Statuses Dropdown

**`GET /int/v1/drivers/statuses`**

Returns all available driver status values for the status filter dropdown.

#### Example Request

```
GET {{url}}/int/v1/drivers/statuses
```

---

## 8. Import Drivers

### Step 1 — Upload File

**`POST /int/v1/uploads`** (file upload service)

Uploads the spreadsheet file to S3 before processing.

| Field | Value |
|---|---|
| `path` | `{AWS_FILE_PATH}/driver-imports/{company_uuid}` |
| `disk` | configured AWS disk |
| `bucket` | configured AWS bucket |
| `type` | `driver_import` |

Accepted file types: `.xls`, `.xlsx`, `.csv`

### Step 2 — Process Import

**`POST /int/v1/drivers/import`**

Processes the uploaded file and creates driver records.

#### Request Body

```json
{
  "files": [
    "uploaded_file_uuid_1",
    "uploaded_file_uuid_2"
  ]
}
```

#### Response — Success

```json
{
  "imported": 25,
  "skipped": 2
}
```

#### Response — Partial Error

```json
{
  "error_log_url": "https://s3.amazonaws.com/.../driver-import-errors.csv"
}
```

> If `error_log_url` is present, some rows failed. The page refreshes to show successfully imported drivers and the error log CSV can be downloaded.

---

## 9. Export Drivers

**`GET /int/v1/drivers/export`**

Exports driver data to a spreadsheet file.

#### Query Parameters

| Param | Type | Description |
|---|---|---|
| `selections[]` | UUID[] | List of driver IDs to export. If empty, all visible drivers are exported. |

#### Example Request

```
GET {{url}}/int/v1/drivers/export?selections[]=drv_abc&selections[]=drv_xyz
```

---

## 10. Set Shift (Uniform / Day-wise)

Shift preferences are saved as part of the driver record via **`PUT /int/v1/drivers/{id}`**.

### Uniform Shift (same time every day)

```json
{
  "shift_preferences": {
    "all_days": {
      "start": "08:00:00",
      "end": "18:00:00"
    }
  }
}
```

### Day-wise Shift (different time per day)

```json
{
  "shift_preferences": {
    "monday": [{ "start": "08:00:00", "end": "16:00:00" }],
    "tuesday": [{ "start": "09:00:00", "end": "17:00:00" }],
    "wednesday": [{ "start": "08:00:00", "end": "16:00:00" }],
    "thursday": [{ "start": "09:00:00", "end": "17:00:00" }],
    "friday": [{ "start": "08:00:00", "end": "14:00:00" }],
    "saturday": [],
    "sunday": []
  }
}
```

#### Notes

- `all_days` key → Uniform shift mode (one time range for all days)
- Named day keys (`monday`–`sunday`) → Day-wise shift mode
- Empty array `[]` for a day means the driver is not working that day
- Default shift: `08:00:00` – `18:00:00` (all days)

---

## 11. Search Drivers

**`GET /int/v1/drivers?query={search_term}`**

Triggers a full-text search with a 200ms debounce. Updates the URL query param and refreshes the model.

#### Example Request

```
GET {{url}}/int/v1/drivers?query=john&limit=300&sort=created_at
```

---

## 12. Filter Drivers

**`GET /int/v1/drivers`** with filter query params.

Each column in the table supports filtering. Filters are combined as AND conditions.

#### Example — Filter by fleet and status

```
GET {{url}}/int/v1/drivers?fleet=flt_abc123&status=active&limit=300
```

#### All Filterable Params

| Param | Filter Type | Example |
|---|---|---|
| `name` | string match | `name=John` |
| `public_id` | string match | `public_id=DRV-0001` |
| `internal_id` | string match | `internal_id=DRV-001` |
| `drivers_license_number` | string match | `drivers_license_number=UK654` |
| `phone` | string match | `phone=+44791` |
| `country` | country code | `country=GB` |
| `status` | select | `status=active` |
| `fleet` | model UUID | `fleet=flt_abc123` |
| `vehicle` | model UUID | `vehicle=veh_abc123` |
| `vendor` | model UUID | `vendor=vnd_abc123` |
| `priority` | number | `priority=1` |
| `created_at` | date | `created_at=2026-03-01` |
| `updated_at` | date | `updated_at=2026-03-27` |

---

## 13. Clear Filters

Clears all active filters by resetting all query params to `undefined` / default values, then reloading with:

```
GET {{url}}/int/v1/drivers?page=1&limit=300&sort=created_at
```

---

## 14. Bulk Priority Update (Drag Reorder)

**`PUT /int/v1/drivers/bulk-priority`**

Saves new driver priorities after drag-and-drop reordering in the table.

#### Request Body

```json
{
  "drivers": [
    { "id": "DRV-0001", "priority": 1 },
    { "id": "DRV-0002", "priority": 2 },
    { "id": "DRV-0003", "priority": 3 }
  ]
}
```

#### Response

```json
{
  "status": "OK"
}
```

---

## 15. Delete Driver

**`DELETE /int/v1/drivers/{id}`**

Deletes a driver after confirmation prompt.

#### Example Request

```
DELETE {{url}}/int/v1/drivers/drv_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 16. Fleets Dropdown (for Fleet column)

**`GET /int/v1/fleets`**

Fetches all fleets to populate the Fleet multi-select column editor.

#### Example Request

```
GET {{url}}/int/v1/fleets
```

---

## Key Driver Fields

| Field | Type | Description |
|---|---|---|
| `public_id` | string | Human-readable ID (e.g. `DRV-0001`) |
| `internal_id` | string | Company internal reference |
| `name` | string | Driver full name |
| `email` | string | Driver email |
| `phone` | string | Driver phone (international format) |
| `country` | string | ISO 3166-1 alpha-2 country code |
| `city` | string | Driver city |
| `drivers_license_number` | string | Driving licence number |
| `vehicle_uuid` | UUID | Assigned vehicle |
| `fleet_uuid` | UUID[] | Assigned fleet(s) |
| `status` | string | `active` or `inactive` |
| `priority` | integer | Display/scheduling priority (used for drag reorder) |
| `shift_preferences` | object | Shift times — uniform (`all_days`) or day-wise |
