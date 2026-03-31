/**
 * Record-Keeping Validator
 * ────────────────────────
 *
 * Validates that the driver's combined historical log data and proposed
 * rota contains complete records for a rolling 29-day window:
 * the evaluation day + the preceding 28 continuous days.
 *
 * Any unaccounted gaps in this window are flagged as violations.
 */

import {
  type DriverRecord,
  type ComplianceViolation,
} from "./types"

import { toDateStr } from "./utils"

// ─── Constants ───────────────────────────────────────────────────────────────

/** The driver must have records for today + 28 preceding days = 29 days */
const ROLLING_WINDOW_DAYS = 29
/** Warn if coverage drops below this threshold */
const COVERAGE_WARNING_THRESHOLD = 0.9  // 90%

// ─── Main Validator ──────────────────────────────────────────────────────────

/**
 * Validate that the driver's records are complete for the 29-day
 * rolling window ending on `evaluationDate`.
 *
 * @param record          The driver's full schedule
 * @param evaluationDate  The date being evaluated (usually "today")
 * @returns               Array of violations / warnings for record gaps
 */
export function validateRecordKeeping(
  record: DriverRecord,
  evaluationDate: string,
): ComplianceViolation[] {
  const issues: ComplianceViolation[] = []

  // Build the set of dates we have records for
  const coveredDates = new Set(record.workingDays.map(d => d.date))

  // Build the 29-day window: evaluationDate - 28 days → evaluationDate
  const evalDate = new Date(evaluationDate + "T12:00:00")
  const windowDates: string[] = []

  for (let i = ROLLING_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(
      evalDate.getFullYear(),
      evalDate.getMonth(),
      evalDate.getDate() - i,
    )
    windowDates.push(toDateStr(d))
  }

  // Find missing dates
  const missingDates = windowDates.filter(d => !coveredDates.has(d))
  const coverage = windowDates.length - missingDates.length

  if (missingDates.length > 0) {
    // Group consecutive missing dates into ranges for cleaner output
    const ranges = groupConsecutiveDates(missingDates)
    const rangeStr = ranges
      .map(r => r.length === 1 ? r[0] : `${r[0]} to ${r[r.length - 1]}`)
      .join(", ")

    const severity = missingDates.length > (ROLLING_WINDOW_DAYS * (1 - COVERAGE_WARNING_THRESHOLD))
      ? "violation" as const
      : "warning" as const

    issues.push({
      ruleId:      "RECORD_KEEPING_29_DAY",
      severity,
      date:        evaluationDate,
      driverUuid:  record.driverUuid,
      message:     `Incomplete records: ${missingDates.length} day(s) unaccounted in the 29-day window`,
      calculation: `${coverage}/${ROLLING_WINDOW_DAYS} days covered. Missing: ${rangeStr}`,
      ruleset:     record.applicableRuleset,
    })
  }

  return issues
}

/**
 * Return the record coverage count for the 29-day window.
 * Used by the orchestrator to populate RotaComplianceReport.recordCoverageDays.
 */
export function getRecordCoverage(
  record: DriverRecord,
  evaluationDate: string,
): number {
  const coveredDates = new Set(record.workingDays.map(d => d.date))
  const evalDate = new Date(evaluationDate + "T12:00:00")
  let count = 0

  for (let i = ROLLING_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(
      evalDate.getFullYear(),
      evalDate.getMonth(),
      evalDate.getDate() - i,
    )
    if (coveredDates.has(toDateStr(d))) count++
  }

  return count
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Groups consecutive date strings into sub-arrays.
 * e.g. ["2025-01-01","2025-01-02","2025-01-05"] →
 *      [["2025-01-01","2025-01-02"], ["2025-01-05"]]
 */
function groupConsecutiveDates(dates: string[]): string[][] {
  if (dates.length === 0) return []

  const sorted = [...dates].sort()
  const groups: string[][] = [[sorted[0]]]

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T12:00:00")
    const curr = new Date(sorted[i] + "T12:00:00")
    const diffDays = (curr.getTime() - prev.getTime()) / 86_400_000

    if (Math.abs(diffDays - 1) < 0.5) {
      // Consecutive — add to current group
      groups[groups.length - 1].push(sorted[i])
    } else {
      // Gap — start new group
      groups.push([sorted[i]])
    }
  }

  return groups
}
