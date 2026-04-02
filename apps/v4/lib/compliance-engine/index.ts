/**
 * Compliance Engine — Public API
 *
 * This is the single entry point imported by the Rota and Trips pages.
 *
 * CURRENT RULE: Overlap detection only.
 *   Two trips assigned to the same driver overlap when:
 *     tripA.startTime < tripB.endTime  AND  tripB.startTime < tripA.endTime
 *
 * The rota page uses:
 *   - runComplianceCheck(driver, today)          → Promise<RotaComplianceReport>
 *   - prospectiveComplianceCheck(driverUuid, date, order, tripIndex) → { violations }
 *   - COMPLIANCE_RULES                           → Rule metadata array
 *   - types: RotaComplianceReport, ComplianceViolation
 *
 * The trips page uses:
 *   - prospectiveComplianceCheck(driverUuid, date, order, tripIndex) → { violations }
 */

import { listOrders } from "@/lib/orders-api"
import type { Order, Driver } from "@/lib/orders-api"
import { findOverlaps } from "./overlap"
import type { Trip } from "./types"

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface ComplianceViolation {
  /** YYYY-MM-DD of the calendar day the violation occurs on */
  date: string
  /** Which rule fired */
  ruleId: "OVERLAP"
  /** Human-readable message shown in the UI */
  message: string
  /** Always 'violation' for overlaps (no warnings, it's a hard block) */
  severity: "violation"
  /** The two overlapping order UUIDs */
  tripAUuid: string
  tripBUuid: string
  /** How many minutes the trips overlap */
  overlapMinutes: number
}

export interface RotaComplianceReport {
  violations: ComplianceViolation[]
  warnings: ComplianceViolation[]   // always empty for now, kept for UI compatibility
}

// ─── Rule Metadata (for rules panel in the compliance drawer) ─────────────────

export const COMPLIANCE_RULES = [
  {
    id: "OVERLAP",
    name: "Overlapping Trips",
    description: "Two trips assigned to the same driver overlap in time. A driver cannot be in two places at once.",
    severity: "violation" as const,
  },
]

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Convert an Order from the API into a Trip for the overlap engine. */
function orderToTrip(order: Order): Trip | null {
  const start = order.scheduled_at
  const end   = order.estimated_end_date

  // We need both a start and an end time to check overlaps.
  // If either is missing, skip this order — we can't reason about it.
  if (!start || !end) return null

  const startTime = new Date(start)
  const endTime   = new Date(end)

  // Sanity check: end must be after start
  if (endTime <= startTime) return null

  return {
    orderId:    order.uuid,
    driverUuid: order.driver_assigned_uuid ?? order.driver_assigned?.uuid ?? "",
    startTime,
    endTime,
  }
}

/** Format minutes as "Xh Ym" for display */
function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Local YYYY-MM-DD from a Date or ISO string */
function toLocalDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d
  const y = dt.getFullYear()
  const mo = String(dt.getMonth() + 1).padStart(2, "0")
  const day = String(dt.getDate()).padStart(2, "0")
  return `${y}-${mo}-${day}`
}

// ─── runComplianceCheck ───────────────────────────────────────────────────────

/**
 * Run a full compliance check for a single driver.
 *
 * Fetches all active trips assigned to this driver (up to the given end date),
 * then checks every pair for time overlaps.
 *
 * Called by the rota page once per driver after load and on week change.
 */
export async function runComplianceCheck(
  driver: Driver,
  _today: string,   // kept for API compatibility — may be used for date-range expansion later
): Promise<RotaComplianceReport> {
  try {
    // Fetch all trips assigned to this driver.
    // We fetch without a date range to catch multi-day trips that started before
    // the visible week. Limit 200 covers any reasonable driver workload.
    const res = await listOrders({
      driver: driver.uuid,
      limit: 200,
      sort: "scheduled_at:asc",
    })

    const orders = res.data ?? []

    // Convert to Trip objects (skip any without start/end times)
    const trips = orders.flatMap(o => {
      const t = orderToTrip(o)
      return t ? [t] : []
    })

    if (trips.length < 2) {
      return { violations: [], warnings: [] }
    }

    // Find all overlapping pairs
    const overlaps = findOverlaps(trips)

    const violations: ComplianceViolation[] = overlaps.map(o => {
      // Report the violation on the date the overlap STARTS
      const overlapDate = toLocalDate(
        new Date(Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime()))
      )

      return {
        date:           overlapDate,
        ruleId:         "OVERLAP",
        severity:       "violation",
        message:        `Trips overlap by ${fmtMinutes(o.overlapMinutes)}: trip starting ${toLocalDate(o.tripA.startTime)} and trip starting ${toLocalDate(o.tripB.startTime)} are both assigned to this driver.`,
        tripAUuid:      o.tripA.orderId,
        tripBUuid:      o.tripB.orderId,
        overlapMinutes: o.overlapMinutes,
      }
    })

    return { violations, warnings: [] }

  } catch {
    // If the API fails, return clean — don't block the UI
    return { violations: [], warnings: [] }
  }
}

// ─── prospectiveComplianceCheck ───────────────────────────────────────────────

/**
 * Check if assigning a new trip to a driver would create any violations.
 *
 * Called BEFORE saving an assignment (both from the rota popover and from the
 * trips page driver dropdown). Returns violations so the UI can block the save.
 *
 * @param driverUuid  UUID of the driver being assigned
 * @param _date       The assignment date (unused — we check all trips in tripIndex)
 * @param newOrder    The order being assigned
 * @param tripIndex   Map of all orders currently loaded in the UI (uuid → Order)
 */
export function prospectiveComplianceCheck(
  driverUuid: string,
  _date: string,
  newOrder: Order,
  tripIndex: Map<string, Order>,
): { violations: ComplianceViolation[] } {
  // Convert the new order to a Trip
  const newTrip = orderToTrip(newOrder)
  if (!newTrip) {
    // Can't check without times — allow the assignment
    return { violations: [] }
  }
  newTrip.driverUuid = driverUuid

  // Collect all existing trips already assigned to this driver from tripIndex
  const existingTrips: Trip[] = []
  tripIndex.forEach(order => {
    // Skip the order being assigned itself (may already be in the index)
    if (order.uuid === newOrder.uuid) return

    const assignedUuid = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assignedUuid !== driverUuid) return

    const t = orderToTrip(order)
    if (t) existingTrips.push(t)
  })

  if (existingTrips.length === 0) {
    return { violations: [] }
  }

  // Check the new trip against every existing trip
  const allTrips = [...existingTrips, newTrip]
  const overlaps = findOverlaps(allTrips).filter(
    o => o.tripA.orderId === newOrder.uuid || o.tripB.orderId === newOrder.uuid
  )

  const violations: ComplianceViolation[] = overlaps.map(o => {
    const overlapDate = toLocalDate(
      new Date(Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime()))
    )
    return {
      date:           overlapDate,
      ruleId:         "OVERLAP",
      severity:       "violation",
      message:        `This trip overlaps with an existing assignment by ${fmtMinutes(o.overlapMinutes)}. The driver is already assigned to a trip during this time.`,
      tripAUuid:      o.tripA.orderId,
      tripBUuid:      o.tripB.orderId,
      overlapMinutes: o.overlapMinutes,
    }
  })

  return { violations }
}
