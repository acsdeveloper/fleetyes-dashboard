/**
 * Weekly Rest Check — EC 561/2006 Article 8.6
 *
 * Self-contained module. Imports only pure logic from weekly-rest.ts.
 * Called by index.ts — do not import index.ts from here.
 *
 * The violation is attributed to the week's last day (Saturday) since the
 * 7-day window has closed without a valid weekly rest period.
 *
 * Only triggered when the driver has ≥ 2 trips (a single trip always implies rest).
 */

import { findWeeklyRestViolation } from "./weekly-rest"
import type { ComplianceViolation, DriverTrip } from "./types"

export interface WeeklyRestCheckResult {
  violations: ComplianceViolation[]
  warnings:   ComplianceViolation[]
}

/**
 * Check weekly rest compliance for a single driver.
 *
 * @param trips       All trips for a single driver in the week window
 * @param weekEndDate YYYY-MM-DD of the last day of the current week (Saturday)
 */
export function checkWeeklyRest(
  trips:       DriverTrip[],
  weekEndDate: string,
): WeeklyRestCheckResult {
  if (trips.length < 2) return { violations: [], warnings: [] }

  const violations: ComplianceViolation[] = []
  const warnings:   ComplianceViolation[] = []

  const result = findWeeklyRestViolation(trips)
  if (!result) return { violations: [], warnings: [] }

  const item: ComplianceViolation = {
    date:            weekEndDate,
    ruleId:          "WEEKLY_REST",
    severity:        result.severity,
    message:         result.message,
    tripAUuid:       result.tripBeforeRestUuid,
    tripBUuid:       result.tripAfterRestUuid,
    durationMinutes: result.longestGapMinutes,
  }

  if (result.severity === "violation") violations.push(item)
  else                                 warnings.push(item)

  return { violations, warnings }
}
