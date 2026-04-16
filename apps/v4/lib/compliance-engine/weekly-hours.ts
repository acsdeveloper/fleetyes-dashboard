import { shiftHours } from "./shift-hours"

export const WEEKLY_HOURS_RULES = {
  // EU Transport Working Time Directive (2002/15/EC):
  //   Absolute single-week max: 60h
  //   Warning threshold: 55h (buffer before absolute limit)
  //   Biweekly max: 90h (same 2-week limit as EC 561/2006 driving hours)
  WEEKLY_WARN_HOURS:     55,
  WEEKLY_MAX_HOURS:      60,
  BIWEEKLY_WARN_HOURS:   80,
  BIWEEKLY_MAX_HOURS:    90,
  WEEKLY_WARN_MS:        55 * 3600 * 1000,
  WEEKLY_MAX_MS:         60 * 3600 * 1000,
  BIWEEKLY_WARN_MS:      80 * 3600 * 1000,
  BIWEEKLY_MAX_MS:       90 * 3600 * 1000,
} as const

export type WeeklyHoursSeverity = "violation" | "warning"

export interface WeeklyHoursResult {
  ruleId:       "WEEKLY_HOURS" | "BIWEEKLY_HOURS"
  totalMinutes: number
  severity:     WeeklyHoursSeverity
  message:      string
  /** All trip UUIDs contributing to this total */
  contributingTripUuids: string[]
}

interface TripWindow {
  orderId:   string
  startTime: Date
  endTime:   Date
}

function fmtHoursMin(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Total derived WORKING milliseconds across all provided trips.
 * Uses shiftHours() to convert raw block durations:
 *   - Single-day block: working = block − 1h
 *   - Multi-day block:  working = 11h (fixed)
 */
function totalWorkingMs(trips: TripWindow[]): number {
  return trips.reduce((sum, t) => {
    const { workingHours } = shiftHours(t.startTime, t.endTime)
    return sum + workingHours * 3_600_000
  }, 0)
}

/**
 * Check weekly driving hours for a set of trips that belong to one week.
 *
 * @param trips       All trips for a single driver in the week window
 * @param weekLabel   Human-readable label e.g. "w/c 6 Apr"
 */
export function checkWeeklyHours(
  trips: TripWindow[],
  weekLabel: string,
): WeeklyHoursResult | null {
  if (trips.length === 0) return null

  const totalMs      = totalWorkingMs(trips)
  const totalMinutes = totalMs / 60000
  const uuids        = trips.map(t => t.orderId)

  if (totalMs > WEEKLY_HOURS_RULES.WEEKLY_MAX_MS) {
    return {
      ruleId:        "WEEKLY_HOURS",
      totalMinutes,
      severity:      "violation",
      message:       `${fmtHoursMin(totalMinutes)} of working time ${weekLabel} — exceeds 60h weekly maximum (EU Transport WTD 2002/15/EC).`,
      contributingTripUuids: uuids,
    }
  }

  if (totalMs > WEEKLY_HOURS_RULES.WEEKLY_WARN_MS) {
    return {
      ruleId:        "WEEKLY_HOURS",
      totalMinutes,
      severity:      "warning",
      message:       `${fmtHoursMin(totalMinutes)} of working time ${weekLabel} — approaching 60h weekly maximum (EU Transport WTD 2002/15/EC).`,
      contributingTripUuids: uuids,
    }
  }

  return null  // compliant
}

/**
 * Check biweekly (two consecutive weeks) driving hours.
 *
 * @param tripsWeek1  Trips from week 1
 * @param tripsWeek2  Trips from week 2
 * @param label       Human-readable label e.g. "weeks 6–7 Apr"
 */
export function checkBiweeklyHours(
  tripsWeek1: TripWindow[],
  tripsWeek2: TripWindow[],
  label: string,
): WeeklyHoursResult | null {
  const allTrips   = [...tripsWeek1, ...tripsWeek2]
  if (allTrips.length === 0) return null

  const totalMs      = totalWorkingMs(allTrips)
  const totalMinutes = totalMs / 60000
  const uuids        = allTrips.map(t => t.orderId)

  if (totalMs > WEEKLY_HOURS_RULES.BIWEEKLY_MAX_MS) {
    return {
      ruleId:        "BIWEEKLY_HOURS",
      totalMinutes,
      severity:      "violation",
      message:       `${fmtHoursMin(totalMinutes)} of working time across ${label} — exceeds 90h biweekly maximum (EU Transport WTD 2002/15/EC).`,
      contributingTripUuids: uuids,
    }
  }

  if (totalMs > WEEKLY_HOURS_RULES.BIWEEKLY_WARN_MS) {
    return {
      ruleId:        "BIWEEKLY_HOURS",
      totalMinutes,
      severity:      "warning",
      message:       `${fmtHoursMin(totalMinutes)} of working time across ${label} — approaching 90h biweekly maximum (EU Transport WTD 2002/15/EC).`,
      contributingTripUuids: uuids,
    }
  }

  return null
}
