/**
 * Compliance Engine — Public API
 *
 * Entry point imported by Rota and Trips pages.
 *
 * Rules (EC 561/2006 / UK HGV):
 *   OVERLAP    — two trips overlap in time (violation)
 *   REST_GAP   — gap between consecutive trips < 9h (violation) or 9h–11h (warning)
 *
 * Exports:
 *   runComplianceCheck(driverUuid, tripIndex)                  → RotaComplianceReport
 *   prospectiveComplianceCheck(driverUuid, date, order, index) → { violations }
 *   COMPLIANCE_RULES                                           → rule metadata
 *   types: RotaComplianceReport, ComplianceViolation
 */

import type { Order } from "@/lib/orders-api"
import { findOverlaps } from "./overlap"
import { findRestGapViolations } from "./rest-gap"
import type { Trip } from "./types"

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface ComplianceViolation {
  /** YYYY-MM-DD of the calendar day the violation occurs */
  date: string
  ruleId: "OVERLAP" | "REST_GAP"
  message: string
  severity: "violation" | "warning"
  tripAUuid: string
  tripBUuid: string
  /** Minutes of overlap (OVERLAP) or minutes of actual gap (REST_GAP) */
  durationMinutes: number
}

export interface RotaComplianceReport {
  violations: ComplianceViolation[]
  warnings:   ComplianceViolation[]
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
  {
    id: "REST_GAP",
    name: "Insufficient Rest Period",
    description:
      "EC 561/2006: drivers must have at least 11h rest between shifts (or 9h reduced rest, max 3× per week). A gap below 9h is a violation; 9h–11h is a warning.",
    severity: "violation" as const,  // can produce warnings too
  },
]

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Convert an Order to a Trip for the overlap engine.
 * Falls back to scheduled_at+time (seconds) then scheduled_at+8h if no end time.
 * Returns null only when scheduled_at is missing.
 */
function orderToTrip(order: Order): Trip | null {
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

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Get all trips for a specific driver from the tripIndex */
function driverTrips(driverUuid: string, tripIndex: Map<string, Order>): Trip[] {
  const trips: Trip[] = []
  tripIndex.forEach(order => {
    const assignedUuid = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assignedUuid !== driverUuid) return
    const t = orderToTrip(order)
    if (t) trips.push(t)
  })
  return trips
}

// ─── runComplianceCheck ───────────────────────────────────────────────────────

/**
 * Full compliance check for one driver using the already-loaded tripIndex.
 * No extra API calls — checks exactly what the UI shows.
 */
export function runComplianceCheck(
  driverUuid: string,
  tripIndex: Map<string, Order>,
): RotaComplianceReport {
  const trips = driverTrips(driverUuid, tripIndex)

  if (trips.length < 2) return { violations: [], warnings: [] }

  const violations: ComplianceViolation[] = []
  const warnings:   ComplianceViolation[] = []

  // ── Rule 1: Overlap ────────────────────────────────────────────────────────
  for (const o of findOverlaps(trips)) {
    violations.push({
      date:            toLocalDate(new Date(Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime()))),
      ruleId:          "OVERLAP",
      severity:        "violation",
      message:         `Trips overlap by ${fmtMinutes(o.overlapMinutes)}: trip on ${toLocalDate(o.tripA.startTime)} and trip on ${toLocalDate(o.tripB.startTime)}.`,
      tripAUuid:       o.tripA.orderId,
      tripBUuid:       o.tripB.orderId,
      durationMinutes: o.overlapMinutes,
    })
  }

  // ── Rule 2: Rest Gap ───────────────────────────────────────────────────────
  for (const r of findRestGapViolations(trips)) {
    const item: ComplianceViolation = {
      date:            r.date,
      ruleId:          "REST_GAP",
      severity:        r.severity,
      message:         r.message,
      tripAUuid:       r.tripAUuid,
      tripBUuid:       r.tripBUuid,
      durationMinutes: r.gapMinutes,
    }
    if (r.severity === "violation") violations.push(item)
    else warnings.push(item)
  }

  return { violations, warnings }
}

// ─── prospectiveComplianceCheck ───────────────────────────────────────────────

/**
 * Check if assigning a new trip to a driver would create a violation.
 * Checks overlaps AND rest gap against all existing trips for this driver.
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

  // Existing trips for this driver (excluding the new one)
  const existing: Trip[] = []
  tripIndex.forEach(order => {
    if (order.uuid === newOrder.uuid) return
    const assignedUuid = order.driver_assigned_uuid ?? order.driver_assigned?.uuid
    if (assignedUuid !== driverUuid) return
    const t = orderToTrip(order)
    if (t) existing.push(t)
  })

  if (existing.length === 0) return { violations: [] }

  const all = [...existing, newTrip]
  const violations: ComplianceViolation[] = []

  // Check overlaps
  for (const o of findOverlaps(all)) {
    if (o.tripA.orderId !== newOrder.uuid && o.tripB.orderId !== newOrder.uuid) continue
    violations.push({
      date:            toLocalDate(new Date(Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime()))),
      ruleId:          "OVERLAP",
      severity:        "violation",
      message:         `This trip overlaps an existing assignment by ${fmtMinutes(o.overlapMinutes)}. Driver already has a trip during this time.`,
      tripAUuid:       o.tripA.orderId,
      tripBUuid:       o.tripB.orderId,
      durationMinutes: o.overlapMinutes,
    })
  }

  // Check rest gaps (only pairs involving the new trip)
  for (const r of findRestGapViolations(all)) {
    if (r.tripAUuid !== newOrder.uuid && r.tripBUuid !== newOrder.uuid) continue
    if (r.severity === "violation") {
      violations.push({
        date:            r.date,
        ruleId:          "REST_GAP",
        severity:        "violation",
        message:         r.message,
        tripAUuid:       r.tripAUuid,
        tripBUuid:       r.tripBUuid,
        durationMinutes: r.gapMinutes,
      })
    }
    // Warnings in prospective check: don't block the assignment, just note
  }

  return { violations }
}
