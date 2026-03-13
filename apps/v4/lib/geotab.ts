/**
 * FleetYes — MyGeotab API Client
 *
 * Geotab uses a JSON-RPC 2.0 API at:
 *   POST https://<server>/apiv1
 *
 * Fill in GEOTAB_CONFIG below with your real credentials.
 * All API calls use "MultiCall" to batch requests in a single round-trip.
 *
 * Docs: https://developers.geotab.com/myGeotab/apiReference
 */

// ─── CONFIG (edit these) ──────────────────────────────────────────────────────

export const GEOTAB_CONFIG = {
  server:   "my.geotab.com",       // e.g. "my3.geotab.com"
  database: "YOUR_COMPANY_DB",     // e.g. "fleetyes"
  userName: "api@fleetyes.co.uk",  // service account email
  password: "YOUR_API_PASSWORD",   // service account password
} as const

// ─── GEOTAB TYPES (per API reference) ────────────────────────────────────────

export type GeotabId = string

/** Device — represents a vehicle/asset in MyGeotab */
export interface GeotabDevice {
  id: GeotabId
  name: string
  licensePlate: string
  vehicleIdentificationNumber: string  // VIN
  serialNumber: string
  comment?: string
  groups?: { id: GeotabId }[]
}

/** LogRecord — one GPS ping */
export interface GeotabLogRecord {
  id: GeotabId
  device: { id: GeotabId }
  dateTime: string              // ISO 8601
  latitude: number
  longitude: number
  speed: number                 // km/h
}

/** Diagnostic — engine parameter definition */
export interface GeotabDiagnostic {
  id: GeotabId
  name: string                  // e.g. "Engine Speed", "Fuel Level"
  unitOfMeasure?: { id: string }
}

/** StatusData — one engine telemetry reading */
export interface GeotabStatusData {
  id: GeotabId
  device: { id: GeotabId }
  diagnostic: GeotabDiagnostic
  dateTime: string
  data: number                  // raw numeric value
}

/** Rule — speed/safety rule definition */
export interface GeotabRule {
  id: GeotabId
  name: string                  // e.g. "Speeding", "Harsh Braking"
  comment?: string
}

/** ExceptionEvent — a triggered safety alert */
export interface GeotabExceptionEvent {
  id: GeotabId
  device: { id: GeotabId }
  rule: GeotabRule
  driver?: { id: GeotabId; name?: string }
  activeFrom: string            // ISO 8601
  activeTo: string              // ISO 8601
  distance: number              // metres
  duration: number              // seconds
  state: "Active" | "Inactive"
}

/** Trip — summarised journey */
export interface GeotabTrip {
  id: GeotabId
  device: { id: GeotabId }
  start: string                 // ISO 8601
  stop: string                  // ISO 8601
  distance: number              // metres
  maxSpeed: number              // km/h
  averageSpeed: number          // km/h
  startLatitude: number
  startLongitude: number
  stopLatitude: number
  stopLongitude: number
  driver?: { id: GeotabId }
}

// ─── JSON-RPC CLIENT ──────────────────────────────────────────────────────────

interface RpcRequest {
  method: string
  params: Record<string, unknown>
}

interface RpcResponse<T> {
  result: T
  error?: { message: string; name: string }
}

const BASE_URL = () => `https://${GEOTAB_CONFIG.server}/apiv1`

async function rpc<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(BASE_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method,
      params: {
        credentials: {
          database: GEOTAB_CONFIG.database,
          userName: GEOTAB_CONFIG.userName,
          password: GEOTAB_CONFIG.password,
        },
        ...params,
      },
    }),
  })
  const json: RpcResponse<T> = await res.json()
  if (json.error) throw new Error(`Geotab API error: ${json.error.message}`)
  return json.result
}

/** Execute multiple API calls in a single HTTP round-trip */
async function multiCall<T extends unknown[]>(calls: RpcRequest[]): Promise<T> {
  return rpc<T>("ExecuteMultiCall", { calls })
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────

export const geotabApi = {
  /** Fetch all devices (vehicles) */
  getDevices(): Promise<GeotabDevice[]> {
    return rpc("Get", { typeName: "Device", resultsLimit: 500 })
  },

  /** Fetch latest GPS positions for given device IDs */
  getLatestLogRecords(deviceIds: GeotabId[]): Promise<GeotabLogRecord[]> {
    return rpc("Get", {
      typeName: "LogRecord",
      search: { deviceSearch: { id: deviceIds[0] } }, // single-device; use multiCall for bulk
      resultsLimit: 1,
    })
  },

  /** Fetch GPS track for a date range */
  getLogRecords(params: {
    deviceId: GeotabId
    fromDate: string
    toDate: string
  }): Promise<GeotabLogRecord[]> {
    return rpc("Get", {
      typeName: "LogRecord",
      search: {
        deviceSearch: { id: params.deviceId },
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
      resultsLimit: 5000,
    })
  },

  /** Fetch engine telemetry (StatusData) for a date range */
  getStatusData(params: {
    deviceId: GeotabId
    fromDate: string
    toDate: string
    diagnosticIds?: GeotabId[]
  }): Promise<GeotabStatusData[]> {
    return rpc("Get", {
      typeName: "StatusData",
      search: {
        deviceSearch: { id: params.deviceId },
        fromDate: params.fromDate,
        toDate: params.toDate,
        diagnosticSearch: params.diagnosticIds?.[0]
          ? { id: params.diagnosticIds[0] }
          : undefined,
      },
      resultsLimit: 2000,
    })
  },

  /** Fetch exception events (safety alerts) for a date range */
  getExceptionEvents(params: {
    fromDate: string
    toDate: string
    deviceIds?: GeotabId[]
  }): Promise<GeotabExceptionEvent[]> {
    return rpc("Get", {
      typeName: "ExceptionEvent",
      search: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        deviceSearch: params.deviceIds?.[0] ? { id: params.deviceIds[0] } : undefined,
      },
      resultsLimit: 1000,
    })
  },

  /** Fetch trip history for a date range */
  getTrips(params: {
    fromDate: string
    toDate: string
    deviceIds?: GeotabId[]
  }): Promise<GeotabTrip[]> {
    return rpc("Get", {
      typeName: "Trip",
      search: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        deviceSearch: params.deviceIds?.[0] ? { id: params.deviceIds[0] } : undefined,
      },
      resultsLimit: 1000,
    })
  },

  /** Batch: devices + exception events in one HTTP call */
  getDashboardSnapshot(params: { fromDate: string; toDate: string }) {
    return multiCall<[GeotabDevice[], GeotabExceptionEvent[], GeotabTrip[]]>([
      { method: "Get", params: { typeName: "Device", resultsLimit: 500 } },
      {
        method: "Get",
        params: {
          typeName: "ExceptionEvent",
          search: { fromDate: params.fromDate, toDate: params.toDate },
          resultsLimit: 500,
        },
      },
      {
        method: "Get",
        params: {
          typeName: "Trip",
          search: { fromDate: params.fromDate, toDate: params.toDate },
          resultsLimit: 500,
        },
      },
    ])
  },
}
