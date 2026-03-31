/**
 * GB Domestic Rules — Goods Vehicles Validator
 * ─────────────────────────────────────────────
 *
 * Applies to goods vehicles NOT subject to Assimilated (EU) rules.
 *
 * Key limits:
 *   • Daily driving  ≤ 10 hours
 *   • Daily duty     ≤ 11 hours (on any day with driving)
 *
 * Off-road driving only counts toward the daily limit if the vehicle
 * is used for agriculture, quarrying, forestry, building work, or
 * civil engineering.
 *
 * Full exemptions (bypass ALL rules):
 *   • Vehicle dealing with an emergency
 *   • Driven by Armed Forces, Police, or Fire Brigade
 *   • Used solely for private driving
 *
 * Duty limit exemptions (bypass daily duty limit only):
 *   • Vehicle < 3.5 tonnes AND used by doctors/vets/midwives,
 *     for inspection/cleaning work, commercial travellers,
 *     AA/RAC breakdowns, or broadcasting
 *
 * Reference: UK DVSA guidance on domestic driving hours
 */

import {
  type DriverRecord,
  type ComplianceViolation,
  type WorkingDay,
  UsageType,
  ActivityType,
} from "./types"

import {
  sumCountableDriving,
  hoursToMinutes,
  fmtMinutes,
  detectOverlaps,
  toDateStr,
} from "./utils"

// ─── Rule Constants ──────────────────────────────────────────────────────────

const DAILY_DRIVING_LIMIT  = hoursToMinutes(10)   // 600 min
const DAILY_DUTY_LIMIT     = hoursToMinutes(11)    // 660 min
const DUTY_EXEMPT_WEIGHT   = 3.5                   // tonnes

// Warning thresholds (alert when approaching limit)
const DRIVING_WARNING_THRESHOLD = hoursToMinutes(9)   // warn at 9h
const DUTY_WARNING_THRESHOLD    = hoursToMinutes(10)  // warn at 10h

// ─── Exemption Checks ────────────────────────────────────────────────────────

/**
 * Check if a day is fully exempt from all GB Domestic Goods rules.
 *
 * Full exemption applies when:
 *   • Vehicle is responding to an emergency
 *   • Driver is Armed Forces, Police, or Fire Brigade
 */
function isFullyExempt(day: WorkingDay): boolean {
  return (
    day.usageType === UsageType.EMERGENCY ||
    day.usageType === UsageType.ARMED_FORCES_POLICE
  )
}

/**
 * Check if a day is exempt from the daily duty limit only.
 *
 * Applies when vehicle weight < 3.5 tonnes AND used by:
 *   • Doctors, vets, midwives
 *   • Inspection/cleaning work, commercial travellers
 *   • AA/RAC breakdowns, broadcasting
 */
function isDutyLimitExempt(day: WorkingDay): boolean {
  return (
    day.vehicleWeightTonnes < DUTY_EXEMPT_WEIGHT &&
    day.usageType === UsageType.DOCTOR_VET
  )
}

/**
 * Determine if off-road driving counts toward the daily limit.
 *
 * It counts ONLY for agriculture, quarrying, forestry, building work,
 * or civil engineering (mapped to UsageType.AGRICULTURE).
 */
function shouldCountOffRoad(day: WorkingDay): boolean {
  return day.usageType === UsageType.AGRICULTURE
}

// ─── Main Validator ──────────────────────────────────────────────────────────

/**
 * Validate a driver's record against GB Domestic Goods rules.
 *
 * @param record  The driver's historical + planned schedule
 * @returns       Array of violations and warnings
 */
export function validateGBDomesticGoods(
  record: DriverRecord,
): ComplianceViolation[] {
  const issues: ComplianceViolation[] = []

  // ═══════════════════════════════════════════════════════════════
  // TRIP OVERLAP DETECTION
  // ═══════════════════════════════════════════════════════════════

  const allDutyActivities = record.workingDays.flatMap(d =>
    d.activities.filter(a =>
      a.activityType === ActivityType.DRIVING ||
      a.activityType === ActivityType.NON_DRIVING_DUTY
    )
  )

  const overlaps = detectOverlaps(allDutyActivities)
  for (const overlap of overlaps) {
    const date = toDateStr(overlap.activityA.startTime)
    issues.push({
      ruleId:      "TRIP_OVERLAP",
      severity:    "violation",
      date,
      driverUuid:  record.driverUuid,
      message:     `Trip overlap detected — two activities run at the same time`,
      calculation: `Overlap of ${fmtMinutes(overlap.overlapMinutes)} between concurrent activities.`,
      ruleset:     "GB_DOMESTIC_GOODS",
    })
  }

  for (const day of record.workingDays) {
    // Skip rest days — no rules apply
    if (day.isRestDay) continue

    // Skip fully exempt days
    if (isFullyExempt(day)) continue

    // Skip days with no driving
    if (!day.hasDriving) continue

    // ── Rule 1: Daily Driving Limit (10h) ────────────────────────
    const countOffRoad = shouldCountOffRoad(day)
    const countableDriving = sumCountableDriving(day, countOffRoad)

    if (countableDriving > DAILY_DRIVING_LIMIT) {
      issues.push({
        ruleId:      "GB_GOODS_DAILY_DRIVE_LIMIT",
        severity:    "violation",
        date:        day.date,
        driverUuid:  record.driverUuid,
        message:     `Daily driving limit exceeded (max 10 hours)`,
        calculation: `${fmtMinutes(countableDriving)} driving vs ${fmtMinutes(DAILY_DRIVING_LIMIT)} limit`,
        ruleset:     "GB_DOMESTIC_GOODS",
      })
    } else if (countableDriving > DRIVING_WARNING_THRESHOLD) {
      issues.push({
        ruleId:      "GB_GOODS_DAILY_DRIVE_LIMIT",
        severity:    "warning",
        date:        day.date,
        driverUuid:  record.driverUuid,
        message:     `Approaching daily driving limit (${fmtMinutes(DAILY_DRIVING_LIMIT - countableDriving)} remaining)`,
        calculation: `${fmtMinutes(countableDriving)} driving vs ${fmtMinutes(DAILY_DRIVING_LIMIT)} limit`,
        ruleset:     "GB_DOMESTIC_GOODS",
      })
    }

    // ── Rule 2: Daily Duty Limit (11h) ───────────────────────────
    // Only applies on days where driving takes place
    // Exempt if vehicle < 3.5t + doctor/vet usage
    if (!isDutyLimitExempt(day)) {
      const totalDuty = day.totalDutyMinutes

      if (totalDuty > DAILY_DUTY_LIMIT) {
        issues.push({
          ruleId:      "GB_GOODS_DAILY_DUTY_LIMIT",
          severity:    "violation",
          date:        day.date,
          driverUuid:  record.driverUuid,
          message:     `Daily duty limit exceeded (max 11 hours on driving days)`,
          calculation: `${fmtMinutes(totalDuty)} on duty vs ${fmtMinutes(DAILY_DUTY_LIMIT)} limit`,
          ruleset:     "GB_DOMESTIC_GOODS",
        })
      } else if (totalDuty > DUTY_WARNING_THRESHOLD) {
        issues.push({
          ruleId:      "GB_GOODS_DAILY_DUTY_LIMIT",
          severity:    "warning",
          date:        day.date,
          driverUuid:  record.driverUuid,
          message:     `Approaching daily duty limit (${fmtMinutes(DAILY_DUTY_LIMIT - totalDuty)} remaining)`,
          calculation: `${fmtMinutes(totalDuty)} on duty vs ${fmtMinutes(DAILY_DUTY_LIMIT)} limit`,
          ruleset:     "GB_DOMESTIC_GOODS",
        })
      }
    }
  }

  return issues
}
