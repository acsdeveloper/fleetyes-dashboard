/**
 * Overlap Check — EC 561/2006 / operational rule
 *
 * Self-contained module. Imports only the pure logic from overlap.ts.
 * Called by index.ts — do not import index.ts from here.
 *
 * Rule: Two trips assigned to the same driver overlap in time.
 *   A.start < B.end AND B.start < A.end → overlap
 *
 * Returns: violations[] only (no warnings — overlaps are always hard violations)
 */

import { findOverlaps } from "./overlap"
import type { ComplianceViolation, DriverTrip } from "./types"

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

export interface OverlapCheckResult {
  violations: ComplianceViolation[]
  warnings:   ComplianceViolation[]  // always empty
}

/**
 * Check for trip overlaps for a single driver.
 * @param trips  All trips assigned to this driver (from orderToTrip)
 */
export function checkOverlap(trips: DriverTrip[]): OverlapCheckResult {
  if (trips.length < 2) return { violations: [], warnings: [] }

  const violations: ComplianceViolation[] = []

  for (const o of findOverlaps(trips)) {
    const overlapStart = new Date(
      Math.max(o.tripA.startTime.getTime(), o.tripB.startTime.getTime())
    )
    violations.push({
      date:            toLocalDate(overlapStart),
      ruleId:          "OVERLAP",
      severity:        "violation",
      message:         `Trips overlap by ${fmtMinutes(o.overlapMinutes)}: trip on ${toLocalDate(o.tripA.startTime)} and trip on ${toLocalDate(o.tripB.startTime)}.`,
      tripAUuid:       o.tripA.orderId,
      tripBUuid:       o.tripB.orderId,
      durationMinutes: o.overlapMinutes,
    })
  }

  return { violations, warnings: [] }
}
