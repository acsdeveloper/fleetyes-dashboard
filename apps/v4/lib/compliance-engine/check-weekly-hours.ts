/**
 * Weekly Hours Check — EC 561/2006 Article 6.3
 *
 * Self-contained module. Imports only pure logic from weekly-hours.ts.
 * Called by index.ts — do not import index.ts from here.
 *
 * Checks:
 *   WEEKLY_HOURS    — total driving in the current week window
 *   BIWEEKLY_HOURS  — total across two consecutive weeks
 *
 * IMPORTANT: The biweekly check requires trips from TWO weeks.
 * If only one week of trips is available (e.g. initial page load),
 * the biweekly check is skipped with no false positives.
 *
 * The "date" attributed to weekly violations is the last day of the week
 * (Saturday) — this is the day the limit is exceeded by.
 */

import { checkWeeklyHours, checkBiweeklyHours } from "./weekly-hours"
import type { ComplianceViolation, DriverTrip } from "./types"

export interface WeeklyHoursCheckResult {
  violations: ComplianceViolation[]
  warnings:   ComplianceViolation[]
}

/**
 * Check weekly and biweekly driving hours for a single driver.
 *
 * @param tripsThisWeek   Trips in the current visible week (Sun–Sat)
 * @param tripsLastWeek   Trips from the prior week (Sun–Sat). Pass [] if not available.
 * @param weekEndDate     YYYY-MM-DD of the last day of the current week (Saturday)
 * @param weekLabel       Human-readable label e.g. "w/c 6 Apr"
 * @param biweeklyLabel   Human-readable label e.g. "weeks 30 Mar – 12 Apr"
 */
export function checkWeeklyHoursRule(
  tripsThisWeek:  DriverTrip[],
  tripsLastWeek:  DriverTrip[],
  weekEndDate:    string,
  weekLabel:      string,
  biweeklyLabel:  string,
): WeeklyHoursCheckResult {
  const violations: ComplianceViolation[] = []
  const warnings:   ComplianceViolation[] = []

  // ── Single week check ─────────────────────────────────────────────────────
  const weekResult = checkWeeklyHours(tripsThisWeek, weekLabel)
  if (weekResult) {
    const [tripAUuid, tripBUuid = tripAUuid] = weekResult.contributingTripUuids
    const item: ComplianceViolation = {
      date:            weekEndDate,
      ruleId:          "WEEKLY_HOURS",
      severity:        weekResult.severity,
      message:         weekResult.message,
      tripAUuid,
      tripBUuid,
      durationMinutes: weekResult.totalMinutes,
    }
    if (weekResult.severity === "violation") violations.push(item)
    else                                     warnings.push(item)
  }

  // ── Biweekly check (only if we have prior week trips) ────────────────────
  if (tripsLastWeek.length > 0) {
    const biResult = checkBiweeklyHours(tripsLastWeek, tripsThisWeek, biweeklyLabel)
    if (biResult) {
      const [tripAUuid, tripBUuid = tripAUuid] = biResult.contributingTripUuids
      const item: ComplianceViolation = {
        date:            weekEndDate,
        ruleId:          "BIWEEKLY_HOURS",
        severity:        biResult.severity,
        message:         biResult.message,
        tripAUuid,
        tripBUuid,
        durationMinutes: biResult.totalMinutes,
      }
      if (biResult.severity === "violation") violations.push(item)
      else                                   warnings.push(item)
    }
  }

  return { violations, warnings }
}
