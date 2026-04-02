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
 *   runComplianceCheck(driverUuid, tripIndex)                  → RotaComplianceReport
 *   prospectiveComplianceCheck(driverUuid, date, order, index) → { violations }
 *   COMPLIANCE_RULES                                           → rule metadata
 *   types: RotaComplianceReport, ComplianceViolation
 */

import type { Order } from "@/lib/orders-api"
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
 * Returns null only when scheduled_at is missing (can't place the trip in time).
 * Falls back to estimated_end_date → scheduled_at+time → scheduled_at+8h for end time.
 */
function orderToTrip(order: Order): Trip | null {
  if (!order.scheduled_at) return null

  const startTime = new Date(order.scheduled_at)

  let endTime: Date
  if (order.estimated_end_date) {
    endTime = new Date(order.estimated_end_date)
  } else if (order.time && order.time > 0) {
    endTime = new Date(startTime.getTime() + order.time * 1000)  // time is in seconds
  } else {
    endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000)  // fallback: 8h
  }

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

function buildViolation(o: ReturnType<typeof findOverlaps>[number]): ComplianceViolation {
  const overlapStart = new Date(
    Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime())
  )
  return {
    date:           toLocalDate(overlapStart),
    ruleId:         "OVERLAP",
    severity:       "violation",
    message:        `Trips overlap by ${fmtMinutes(o.overlapMinutes)}: trip on ${toLocalDate(o.tripA.startTime)} and trip on ${toLocalDate(o.tripB.startTime)}.`,
    tripAUuid:      o.tripA.orderId,
    tripBUuid:      o.tripB.orderId,
    overlapMinutes: o.overlapMinutes,
  }
}

// ─── runComplianceCheck ───────────────────────────────────────────────────────

/**
 * Full compliance check for one driver.
 *
 * Uses the tripIndex already loaded in the rota page — no separate API call.
 * This guarantees we check exactly what the user sees in the UI.
 *
 * @param driverUuid  UUID of the driver to check
 * @param tripIndex   All orders currently loaded in the rota page (uuid → Order)
 */
export function runComplianceCheck(
  driverUuid: string,
  tripIndex: Map<string, Order>,
): RotaComplianceReport {
  // Collect all trips assigned to this driver
  const trips: Trip[] = []
  tripIndex.forEach(order => {
    const assignedUuid = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assignedUuid !== driverUuid) return
    const t = orderToTrip(order)
    if (t) trips.push(t)
  })

  if (trips.length < 2) return { violations: [], warnings: [] }

  const overlaps = findOverlaps(trips)
  const violations = overlaps.map(buildViolation)
  return { violations, warnings: [] }
}

// ─── prospectiveComplianceCheck ───────────────────────────────────────────────

/**
 * Check if assigning a new trip to a driver would create an overlap.
 * Called BEFORE saving. Returns violations so the UI can block the save.
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

  const existingTrips: Trip[] = []
  tripIndex.forEach(order => {
    if (order.uuid === newOrder.uuid) return
    const assignedUuid = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assignedUuid !== driverUuid) return
    const t = orderToTrip(order)
    if (t) existingTrips.push(t)
  })

  if (existingTrips.length === 0) return { violations: [] }

  const overlaps = findOverlaps([...existingTrips, newTrip]).filter(
    o => o.tripA.orderId === newOrder.uuid || o.tripB.orderId === newOrder.uuid
  )

  return { violations: overlaps.map(o => ({
    ...buildViolation(o),
    message: `This trip overlaps an existing assignment by ${fmtMinutes(o.overlapMinutes)}. Driver already has a trip during this time.`,
  })) }
}
