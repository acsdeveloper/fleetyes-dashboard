/**
 * Daily Hours Check — EC 561/2006 Article 6
 *
 * Self-contained module. Imports only pure logic from daily-hours.ts.
 * Called by index.ts — do not import index.ts from here.
 *
 * Each driver's trips are checked per calendar day.
 * Hours are clipped to day boundaries so overnight/multi-day trips are
 * accurately split across the days they span.
 *
 * For violations and warnings, every contributing trip UUID is listed so
 * the UI can highlight all relevant cells.
 */

import { findDailyHoursViolations } from "./daily-hours"
import type { ComplianceViolation, DriverTrip } from "./types"

export interface DailyHoursCheckResult {
  violations: ComplianceViolation[]
  warnings:   ComplianceViolation[]
}

/**
 * Check daily driving hours for a single driver.
 * @param trips  All trips assigned to this driver
 */
export function checkDailyHours(trips: DriverTrip[]): DailyHoursCheckResult {
  if (trips.length === 0) return { violations: [], warnings: [] }

  const violations: ComplianceViolation[] = []
  const warnings:   ComplianceViolation[] = []

  for (const r of findDailyHoursViolations(trips)) {
    // For multi-trip days, use the first contributing trip as tripA and the rest as tripB.
    // If there's only one trip, tripA and tripB are the same.
    const [tripAUuid, tripBUuid = tripAUuid] = r.contributingTripUuids

    const item: ComplianceViolation = {
      date:            r.date,
      ruleId:          "DAILY_HOURS",
      severity:        r.severity,
      message:         r.message,
      tripAUuid,
      tripBUuid,
      durationMinutes: r.totalMinutes,
    }

    if (r.severity === "violation") violations.push(item)
    else                            warnings.push(item)
  }

  return { violations, warnings }
}
