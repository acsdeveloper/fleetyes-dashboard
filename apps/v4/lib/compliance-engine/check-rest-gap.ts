/**
 * Rest Gap Check — EC 561/2006 (UK/EU HGV)
 *
 * Self-contained module. Imports only the pure logic from rest-gap.ts.
 * Called by index.ts — do not import index.ts from here.
 *
 * Rules:
 *   gap < 9h         → VIOLATION  (illegal — below absolute minimum)
 *   9h < gap < 11h   → WARNING    (reduced daily rest — max 3× per week)
 *   gap ≥ 11h        → compliant
 *
 * Note on date attribution:
 *   Each issue is attributed to the date tripB STARTS (when the driver
 *   begins working again after insufficient rest). This is the actionable
 *   date — the cell to highlight is the one where the next trip begins.
 */

import { findRestGapViolations } from "./rest-gap"
import type { ComplianceViolation, DriverTrip } from "./types"

export interface RestGapCheckResult {
  violations: ComplianceViolation[]
  warnings:   ComplianceViolation[]
}

/**
 * Check for rest gap violations and warnings for a single driver.
 * @param trips  All trips assigned to this driver (from orderToTrip)
 */
export function checkRestGap(trips: DriverTrip[]): RestGapCheckResult {
  if (trips.length < 2) return { violations: [], warnings: [] }

  const violations: ComplianceViolation[] = []
  const warnings:   ComplianceViolation[] = []

  for (const r of findRestGapViolations(trips)) {
    const item: ComplianceViolation = {
      date:            r.date,       // date tripB starts — cell to highlight
      ruleId:          "REST_GAP",
      severity:        r.severity,
      message:         r.message,
      tripAUuid:       r.tripAUuid,
      tripBUuid:       r.tripBUuid,
      durationMinutes: r.gapMinutes,
    }

    if (r.severity === "violation") violations.push(item)
    else                            warnings.push(item)
  }

  return { violations, warnings }
}
