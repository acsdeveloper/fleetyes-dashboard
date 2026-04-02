/**
 * Compliance Engine — Public API
 *
 * Entry point imported by Rota and Trips pages.
 *
 * CURRENT RULE: Overlap detection only.
 *   Two trips overlap when:
 *     tripA.startTime < tripB.endTime  AND  tripB.startTime < tripA.endTime
 *
 * Exports:
 *   runComplianceCheck(driver, today)                          → Promise<RotaComplianceReport>
 *   prospectiveComplianceCheck(driverUuid, date, order, index) → { violations }
 *   COMPLIANCE_RULES                                           → rule metadata
 *   types: RotaComplianceReport, ComplianceViolation
 */

import { listOrders } from "@/lib/orders-api"
import type { Order } from "@/lib/orders-api"
import type { Driver } from "@/lib/drivers-api"
import { findOverlaps } from "./overlap"
import type { Trip } from "./types"

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface ComplianceViolation {
  /** YYYY-MM-DD of the calendar day the violation occurs */
  date: string
  ruleId: "OVERLAP"
  message: string
  severity: "violation"
  tripAUuid: string
  tripBUuid: string
  overlapMinutes: number
}

export interface RotaComplianceReport {
  violations: ComplianceViolation[]
  warnings: ComplianceViolation[]   // empty for now — kept for UI compatibility
}

// ─── Rule Metadata ────────────────────────────────────────────────────────────

export const COMPLIANCE_RULES = [
  {
    id: "OVERLAP",
    name: "Overlapping Trips",
    description:
      "Two trips assigned to the same driver overlap in time. A driver cannot be in two places at once.",
    severity: "violation" as const,
  },
]

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Convert an Order to a Trip for the overlap engine.
 *
 * End-time resolution (in priority order):
 *   1. estimated_end_date   — explicit API end time
 *   2. scheduled_at + time  — start + duration (time is in SECONDS per API convention)
 *   3. scheduled_at + 8h    — conservative fallback so trips are never silently dropped
 *
 * Returns null only when scheduled_at itself is missing.
 */
function orderToTrip(order: Order): Trip | null {
  if (!order.scheduled_at) return null

  const startTime = new Date(order.scheduled_at)

  let endTime: Date

  if (order.estimated_end_date) {
    endTime = new Date(order.estimated_end_date)
  } else if (order.time && order.time > 0) {
    // `time` field is trip duration in seconds
    endTime = new Date(startTime.getTime() + order.time * 1000)
  } else {
    // No end time at all — assume 8-hour shift as a safe fallback
    endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000)
  }

  // Sanity check — end must be after start
  if (endTime <= startTime) {
    endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000)
  }

  return {
    orderId:    order.uuid,
    driverUuid: order.driver_assigned_uuid ?? order.driver_assigned?.uuid ?? "",
    startTime,
    endTime,
  }
}

function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ─── runComplianceCheck ───────────────────────────────────────────────────────

/**
 * Full compliance check for one driver.
 * Fetches all trips assigned to this driver via the API, then checks every
 * pair for time overlaps.
 *
 * Called by the rota page once per driver on load and on week change.
 */
export async function runComplianceCheck(
  driver: Driver,
  _today: string,
): Promise<RotaComplianceReport> {
  try {
    // Fetch all orders assigned to this driver.
    // We use a broad date range and filter client-side by driver UUID to be
    // resilient to API filter behaviour differences across environments.
    const res = await listOrders({
      driver: driver.uuid,
      limit: 500,
      sort: "scheduled_at:asc",
    })

    const orders = (res.data ?? []).filter(o => {
      const assignedUuid = o.driver_assigned_uuid ?? o.driver_assigned?.uuid
      return assignedUuid === driver.uuid
    })

    if (orders.length < 2) {
      return { violations: [], warnings: [] }
    }

    const trips: Trip[] = orders.flatMap(o => {
      const t = orderToTrip(o)
      return t ? [t] : []
    })

    if (trips.length < 2) {
      return { violations: [], warnings: [] }
    }

    const overlaps = findOverlaps(trips)

    const violations: ComplianceViolation[] = overlaps.map(o => {
      const overlapStart = new Date(
        Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime())
      )
      return {
        date:           toLocalDate(overlapStart),
        ruleId:         "OVERLAP",
        severity:       "violation",
        message:        `Trips overlap by ${fmtMinutes(o.overlapMinutes)}: one starting ${toLocalDate(o.tripA.startTime)} and another starting ${toLocalDate(o.tripB.startTime)}.`,
        tripAUuid:      o.tripA.orderId,
        tripBUuid:      o.tripB.orderId,
        overlapMinutes: o.overlapMinutes,
      }
    })

    return { violations, warnings: [] }

  } catch {
    return { violations: [], warnings: [] }
  }
}

// ─── prospectiveComplianceCheck ───────────────────────────────────────────────

/**
 * Check if assigning a new trip to a driver would create an overlap.
 *
 * Called BEFORE saving an assignment. Returns violations so the UI can block
 * the save and show an error.
 *
 * @param driverUuid  Driver being assigned
 * @param _date       Assignment date (unused — we scan all trips in tripIndex)
 * @param newOrder    The order being newly assigned
 * @param tripIndex   All orders currently in the UI (uuid → Order)
 */
export function prospectiveComplianceCheck(
  driverUuid: string,
  _date: string,
  newOrder: Order,
  tripIndex: Map<string, Order>,
): { violations: ComplianceViolation[] } {
  const newTrip = orderToTrip(newOrder)
  if (!newTrip) return { violations: [] }
  newTrip.driverUuid = driverUuid

  // All trips already assigned to this driver in the current UI state
  const existingTrips: Trip[] = []
  tripIndex.forEach(order => {
    if (order.uuid === newOrder.uuid) return  // skip self
    const assignedUuid = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assignedUuid !== driverUuid) return
    const t = orderToTrip(order)
    if (t) existingTrips.push(t)
  })

  if (existingTrips.length === 0) return { violations: [] }

  // Check new trip against all existing trips
  const overlaps = findOverlaps([...existingTrips, newTrip]).filter(
    o => o.tripA.orderId === newOrder.uuid || o.tripB.orderId === newOrder.uuid
  )

  const violations: ComplianceViolation[] = overlaps.map(o => {
    const overlapStart = new Date(
      Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime())
    )
    return {
      date:           toLocalDate(overlapStart),
      ruleId:         "OVERLAP",
      severity:       "violation",
      message:        `This trip overlaps an existing assignment by ${fmtMinutes(o.overlapMinutes)}. The driver already has a trip during this time.`,
      tripAUuid:      o.tripA.orderId,
      tripBUuid:      o.tripB.orderId,
      overlapMinutes: o.overlapMinutes,
    }
  })

  return { violations }
}
