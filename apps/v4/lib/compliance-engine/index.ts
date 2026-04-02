/**
 * Compliance Engine — Orchestrator
 *
 * This file contains ZERO rule logic.
 * It only:
 *   1. Converts API Order objects → DriverTrip[]
 *   2. Calls each check module in sequence
 *   3. Merges results into RotaComplianceReport
 *
 * To add a new rule:
 *   - Create check-<rule>.ts with a check<Rule>(trips) function
 *   - Import and call it in runComplianceCheck and prospectiveComplianceCheck below
 *   - That is all.
 *
 * Public API:
 *   runComplianceCheck(driverUuid, tripIndex)                  → RotaComplianceReport
 *   prospectiveComplianceCheck(driverUuid, date, order, index) → { violations }
 *   COMPLIANCE_RULES                                           → rule metadata for UI
 *   re-exports: ComplianceViolation, RotaComplianceReport
 */

import type { Order } from "@/lib/orders-api"
import type { DriverTrip } from "./types"
import { checkOverlap }  from "./check-overlap"
import { checkRestGap }  from "./check-rest-gap"

// Re-export types so the UI only needs to import from one place
export type { ComplianceViolation, RotaComplianceReport } from "./types"

// ─── Rule Metadata (for the compliance panel drawer) ─────────────────────────

export const COMPLIANCE_RULES = [
  {
    id:          "OVERLAP",
    name:        "Overlapping Trips",
    description: "Two trips assigned to the same driver overlap in time. A driver cannot be in two places at once.",
    severity:    "violation" as const,
  },
  {
    id:          "REST_GAP",
    name:        "Insufficient Rest Period",
    description: "EC 561/2006: minimum 11h rest required between shifts (reduced to 9h allowed max 3× per week). Gap < 9h = violation. Gap 9–11h = warning.",
    severity:    "violation" as const,
  },
]

// ─── Order → DriverTrip conversion ───────────────────────────────────────────

/**
 * Convert an API Order to a DriverTrip for the check modules.
 *
 * End-time resolution (priority order):
 *   1. estimated_end_date  — explicit API end time
 *   2. scheduled_at + time — start + duration (time is in seconds per API)
 *   3. scheduled_at + 8h   — conservative fallback; trip is never silently dropped
 *
 * Returns null only when scheduled_at is missing (can't place the trip in time at all).
 */
function orderToTrip(order: Order): DriverTrip | null {
  if (!order.scheduled_at) return null

  const startTime = new Date(order.scheduled_at)

  let endTime: Date
  if (order.estimated_end_date) {
    endTime = new Date(order.estimated_end_date)
  } else if (order.time && order.time > 0) {
    endTime = new Date(startTime.getTime() + order.time * 1000)
  } else {
    endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000)
  }

  // Sanity: end must be after start
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

/** Extract all trips for one driver from the tripIndex */
function getDriverTrips(driverUuid: string, tripIndex: Map<string, Order>): DriverTrip[] {
  const trips: DriverTrip[] = []
  tripIndex.forEach(order => {
    const assigned = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assigned !== driverUuid) return
    const t = orderToTrip(order)
    if (t) trips.push(t)
  })
  return trips
}

// ─── runComplianceCheck ───────────────────────────────────────────────────────

/**
 * Full compliance check for one driver.
 * Uses the tripIndex already loaded in the rota page — no extra API calls.
 * Calls each rule check module in sequence and merges results.
 *
 * @param driverUuid  Driver to check
 * @param tripIndex   All orders currently loaded in the UI (uuid → Order)
 */
export function runComplianceCheck(
  driverUuid: string,
  tripIndex: Map<string, Order>,
) {
  const trips = getDriverTrips(driverUuid, tripIndex)

  // ── Check 1: Overlap ──────────────────────────────────────────────────────
  const overlapResult = checkOverlap(trips)

  // ── Check 2: Rest Gap ─────────────────────────────────────────────────────
  const restGapResult = checkRestGap(trips)

  // ── Merge ─────────────────────────────────────────────────────────────────
  return {
    violations: [
      ...overlapResult.violations,
      ...restGapResult.violations,
    ],
    warnings: [
      ...overlapResult.warnings,    // always empty for overlap
      ...restGapResult.warnings,
    ],
  }
}

// ─── prospectiveComplianceCheck ───────────────────────────────────────────────

/**
 * Check if assigning a new trip to a driver would create a VIOLATION.
 * Called before saving. Only violations block the assignment — warnings do not.
 *
 * Calls each rule check module in sequence with the combined trip set,
 * then filters to only pairs involving the new trip.
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
) {
  const newTrip = orderToTrip(newOrder)
  if (!newTrip) return { violations: [] }
  newTrip.driverUuid = driverUuid

  // Existing trips for this driver (excluding the one being assigned)
  const existing = getDriverTrips(driverUuid, tripIndex).filter(
    t => t.orderId !== newOrder.uuid
  )
  if (existing.length === 0) return { violations: [] }

  const all = [...existing, newTrip]

  // ── Check 1: Overlap (prospective) ────────────────────────────────────────
  const overlapResult = checkOverlap(all)
  const overlapViolations = overlapResult.violations.filter(
    v => v.tripAUuid === newOrder.uuid || v.tripBUuid === newOrder.uuid
  )

  // ── Check 2: Rest Gap (prospective — violations only, warnings don't block) ──
  const restGapResult = checkRestGap(all)
  const restGapViolations = restGapResult.violations.filter(
    v => v.tripAUuid === newOrder.uuid || v.tripBUuid === newOrder.uuid
  )

  return {
    violations: [
      ...overlapViolations,
      ...restGapViolations,
    ],
  }
}
