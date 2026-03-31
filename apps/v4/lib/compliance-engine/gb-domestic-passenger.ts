/**
 * GB Domestic Rules — Passenger Vehicles (Buses & Coaches) Validator
 * ──────────────────────────────────────────────────────────────────
 *
 * Applies to passenger vehicles not subject to Assimilated (EU) rules.
 *
 * Key limits:
 *   • Daily driving    ≤ 10 hours
 *   • Spreadover       ≤ 16 hours (start of work → end of work)
 *   • Break rules      Complex — depends on total duty length
 *   • Daily rest       ≥ 10 hours (reducible to 8.5h max 3× per week)
 *   • Weekly rest      ≥ 24 hours continuous off duty every 2 weeks
 *
 * Exemptions (bypass ALL rules if true):
 *   • Emergency response
 *   • Driving < 4 hours a day in a week
 *
 * Reference: UK DVSA guidance on domestic drivers' hours (bus/coach)
 */

import {
  type DriverRecord,
  type ComplianceViolation,
  type WorkingDay,
  UsageType,
} from "./types"

import {
  hoursToMinutes,
  fmtMinutes,
  restBetweenDays,
  longestContinuousRest,
  isoWeekMonday,
  toDateStr,
  daysInRange,
  checkPassengerBreaks,
} from "./utils"

// ─── Rule Constants ──────────────────────────────────────────────────────────

const DAILY_DRIVING_LIMIT     = hoursToMinutes(10)    // 600 min
const SPREADOVER_LIMIT        = hoursToMinutes(16)    // 960 min
const DAILY_REST_MINIMUM      = hoursToMinutes(10)    // 600 min
const DAILY_REST_REDUCED      = hoursToMinutes(8.5)   // 510 min
const MAX_REDUCED_REST_PER_WEEK = 3
const WEEKLY_REST_MINIMUM     = hoursToMinutes(24)    // 1440 min
const LOW_DRIVING_EXEMPTION   = hoursToMinutes(4)     // 240 min per day

// Warning thresholds
const DRIVING_WARN  = hoursToMinutes(9)
const SPREAD_WARN   = hoursToMinutes(14.5)

// ─── Exemption Checks ────────────────────────────────────────────────────────

function isFullyExempt(day: WorkingDay): boolean {
  return day.usageType === UsageType.EMERGENCY
}

/**
 * Check if the "low driving" exemption applies for the entire week.
 * Driver is exempt if they drive < 4 hours every day in the week.
 */
function isLowDrivingWeek(
  days: WorkingDay[],
  weekStart: string,
  weekEnd: string,
): boolean {
  const weekDays = daysInRange(days, weekStart, weekEnd)
  const drivingDays = weekDays.filter(d => d.hasDriving)
  return drivingDays.every(d => d.totalDrivingMinutes < LOW_DRIVING_EXEMPTION)
}

// ─── Main Validator ──────────────────────────────────────────────────────────

export function validateGBDomesticPassenger(
  record: DriverRecord,
): ComplianceViolation[] {
  const issues: ComplianceViolation[] = []
  const days = record.workingDays

  // ── Per-Day Rules ──────────────────────────────────────────────

  for (const day of days) {
    if (day.isRestDay) continue
    if (isFullyExempt(day)) continue

    // Determine if low-driving exemption applies for this day's week
    const monday = isoWeekMonday(day.date)
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
    const weekStart = toDateStr(monday)
    const weekEnd = toDateStr(sunday)

    if (isLowDrivingWeek(days, weekStart, weekEnd)) continue

    // ── Rule 1: Daily Driving Limit (10h) ──────────────────────
    if (day.hasDriving) {
      const driving = day.totalDrivingMinutes

      if (driving > DAILY_DRIVING_LIMIT) {
        issues.push({
          ruleId:      "GB_PSV_DAILY_DRIVE_LIMIT",
          severity:    "violation",
          date:        day.date,
          driverUuid:  record.driverUuid,
          message:     `Daily driving limit exceeded (max 10 hours)`,
          calculation: `${fmtMinutes(driving)} driving vs ${fmtMinutes(DAILY_DRIVING_LIMIT)} limit`,
          ruleset:     "GB_DOMESTIC_PASSENGER",
        })
      } else if (driving > DRIVING_WARN) {
        issues.push({
          ruleId:      "GB_PSV_DAILY_DRIVE_LIMIT",
          severity:    "warning",
          date:        day.date,
          driverUuid:  record.driverUuid,
          message:     `Approaching daily driving limit (${fmtMinutes(DAILY_DRIVING_LIMIT - driving)} remaining)`,
          calculation: `${fmtMinutes(driving)} driving vs ${fmtMinutes(DAILY_DRIVING_LIMIT)} limit`,
          ruleset:     "GB_DOMESTIC_PASSENGER",
        })
      }
    }

    // ── Rule 2: Spreadover Limit (16h) ─────────────────────────
    const spread = day.spreadoverMinutes
    if (spread > SPREADOVER_LIMIT) {
      issues.push({
        ruleId:      "GB_PSV_SPREADOVER",
        severity:    "violation",
        date:        day.date,
        driverUuid:  record.driverUuid,
        message:     `Spreadover exceeded (max 16 hours from start to finish of work)`,
        calculation: `${fmtMinutes(spread)} spreadover vs ${fmtMinutes(SPREADOVER_LIMIT)} limit`,
        ruleset:     "GB_DOMESTIC_PASSENGER",
      })
    } else if (spread > SPREAD_WARN) {
      issues.push({
        ruleId:      "GB_PSV_SPREADOVER",
        severity:    "warning",
        date:        day.date,
        driverUuid:  record.driverUuid,
        message:     `Approaching spreadover limit (${fmtMinutes(SPREADOVER_LIMIT - spread)} remaining)`,
        calculation: `${fmtMinutes(spread)} spreadover vs ${fmtMinutes(SPREADOVER_LIMIT)} limit`,
        ruleset:     "GB_DOMESTIC_PASSENGER",
      })
    }

    // ── Rule 3: Break Rules ────────────────────────────────────
    if (day.hasDriving) {
      const breakResult = checkPassengerBreaks(day)
      if (!breakResult.isSatisfied) {
        issues.push({
          ruleId:      "GB_PSV_BREAKS",
          severity:    "violation",
          date:        day.date,
          driverUuid:  record.driverUuid,
          message:     breakResult.description ?? "Break requirements not met",
          calculation: `Total duty: ${fmtMinutes(day.totalDutyMinutes)}, breaks taken: ${fmtMinutes(day.totalBreakMinutes)}`,
          ruleset:     "GB_DOMESTIC_PASSENGER",
        })
      }
    }
  }

  // ── Rule 4: Daily Rest (10h, reducible to 8.5h max 3×/week) ──

  // Sort days chronologically
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))

  // Track reduced rests per ISO week
  const reducedRestsPerWeek = new Map<string, number>()

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    if (prev.isRestDay || curr.isRestDay) continue
    if (isFullyExempt(prev) || isFullyExempt(curr)) continue

    const rest = restBetweenDays(prev, curr)
    const weekMonday = toDateStr(isoWeekMonday(curr.date))

    if (rest < DAILY_REST_REDUCED) {
      // Below even the reduced minimum
      issues.push({
        ruleId:      "GB_PSV_DAILY_REST",
        severity:    "violation",
        date:        curr.date,
        driverUuid:  record.driverUuid,
        message:     `Daily rest too short (minimum 8h 30m even with reduction)`,
        calculation: `${fmtMinutes(rest)} rest vs ${fmtMinutes(DAILY_REST_REDUCED)} reduced minimum`,
        ruleset:     "GB_DOMESTIC_PASSENGER",
      })
    } else if (rest < DAILY_REST_MINIMUM) {
      // Between 8.5h and 10h — counts as a reduced rest
      const count = (reducedRestsPerWeek.get(weekMonday) ?? 0) + 1
      reducedRestsPerWeek.set(weekMonday, count)

      if (count > MAX_REDUCED_REST_PER_WEEK) {
        issues.push({
          ruleId:      "GB_PSV_REDUCED_REST_LIMIT",
          severity:    "violation",
          date:        curr.date,
          driverUuid:  record.driverUuid,
          message:     `Too many reduced daily rests this week (max ${MAX_REDUCED_REST_PER_WEEK})`,
          calculation: `${count} reduced rests in week of ${weekMonday} (limit: ${MAX_REDUCED_REST_PER_WEEK})`,
          ruleset:     "GB_DOMESTIC_PASSENGER",
        })
      } else if (count === MAX_REDUCED_REST_PER_WEEK) {
        issues.push({
          ruleId:      "GB_PSV_REDUCED_REST_LIMIT",
          severity:    "warning",
          date:        curr.date,
          driverUuid:  record.driverUuid,
          message:     `All ${MAX_REDUCED_REST_PER_WEEK} reduced daily rests used this week — no more reductions allowed`,
          calculation: `${count}/${MAX_REDUCED_REST_PER_WEEK} reduced rests used in week of ${weekMonday}`,
          ruleset:     "GB_DOMESTIC_PASSENGER",
        })
      }
    }
  }

  // ── Rule 5: Weekly Rest (24h continuous every 2 weeks) ────────

  // Check in 2-week windows (Mon–Sun blocks)
  if (sorted.length > 0) {
    const firstDate = sorted[0].date
    const lastDate = sorted[sorted.length - 1].date
    let windowStart = isoWeekMonday(firstDate)

    while (toDateStr(windowStart) <= lastDate) {
      const windowEnd = new Date(
        windowStart.getFullYear(),
        windowStart.getMonth(),
        windowStart.getDate() + 13  // 2 weeks = 14 days, so +13
      )
      const ws = toDateStr(windowStart)
      const we = toDateStr(windowEnd)

      const windowDays = daysInRange(sorted, ws, we)
      if (windowDays.length > 0) {
        const longestRest = longestContinuousRest(windowDays)

        if (longestRest < WEEKLY_REST_MINIMUM) {
          issues.push({
            ruleId:      "GB_PSV_WEEKLY_REST",
            severity:    "violation",
            date:        ws,
            driverUuid:  record.driverUuid,
            message:     `Weekly rest not taken: need 24h continuous off-duty in every 2-week period`,
            calculation: `Longest rest in ${ws} to ${we}: ${fmtMinutes(longestRest)} vs ${fmtMinutes(WEEKLY_REST_MINIMUM)} required`,
            ruleset:     "GB_DOMESTIC_PASSENGER",
          })
        }
      }

      // Move to next 2-week window
      windowStart = new Date(
        windowStart.getFullYear(),
        windowStart.getMonth(),
        windowStart.getDate() + 14
      )
    }
  }

  return issues
}
