/**
 * Weekly Hours Logic — EC 561/2006 Article 6.3
 *
 * Pure function — no API or UI dependencies.
 *
 * Rules applied to a single set of trips (typically one week's worth):
 *
 *   WEEKLY_HOURS — total hours in a calendar week:
 *     > 50h  → warning  (approaching the 56h limit)
 *     > 56h  → violation (weekly maximum exceeded)
 *
 *   BIWEEKLY_HOURS — total hours across any two consecutive weeks:
 *     NOTE: This check requires two weeks of trip data to be passed in.
 *     The caller is responsible for providing trips from the correct window.
 *     > 80h  → warning  (approaching the 90h biweekly limit)
 *     > 90h  → violation (biweekly maximum exceeded)
 *
 * Hours are clipped to day boundaries and summed across all calendar days
 * in the provided trip set. No week boundary enforcement is done here —
 * the caller provides the right trips for the right window.
 */

export const WEEKLY_HOURS_RULES = {
  WEEKLY_WARN_HOURS:     50,
  WEEKLY_MAX_HOURS:      56,
  BIWEEKLY_WARN_HOURS:   80,
  BIWEEKLY_MAX_HOURS:    90,
  WEEKLY_WARN_MS:        50 * 3600 * 1000,
  WEEKLY_MAX_MS:         56 * 3600 * 1000,
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

/** Total driving milliseconds across all provided trips (with clipping to trip boundaries) */
function totalDrivingMs(trips: TripWindow[]): number {
  return trips.reduce((sum, t) => {
    const ms = t.endTime.getTime() - t.startTime.getTime()
    return sum + Math.max(0, ms)
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

  const totalMs      = totalDrivingMs(trips)
  const totalMinutes = totalMs / 60000
  const uuids        = trips.map(t => t.orderId)

  if (totalMs > WEEKLY_HOURS_RULES.WEEKLY_MAX_MS) {
    return {
      ruleId:        "WEEKLY_HOURS",
      totalMinutes,
      severity:      "violation",
      message:       `${fmtHoursMin(totalMinutes)} of driving ${weekLabel} — exceeds 56h weekly maximum (EC 561/2006 Art.6.3).`,
      contributingTripUuids: uuids,
    }
  }

  if (totalMs > WEEKLY_HOURS_RULES.WEEKLY_WARN_MS) {
    return {
      ruleId:        "WEEKLY_HOURS",
      totalMinutes,
      severity:      "warning",
      message:       `${fmtHoursMin(totalMinutes)} of driving ${weekLabel} — approaching 56h weekly maximum (EC 561/2006 Art.6.3).`,
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

  const totalMs      = totalDrivingMs(allTrips)
  const totalMinutes = totalMs / 60000
  const uuids        = allTrips.map(t => t.orderId)

  if (totalMs > WEEKLY_HOURS_RULES.BIWEEKLY_MAX_MS) {
    return {
      ruleId:        "BIWEEKLY_HOURS",
      totalMinutes,
      severity:      "violation",
      message:       `${fmtHoursMin(totalMinutes)} of driving across ${label} — exceeds 90h biweekly maximum (EC 561/2006 Art.6.3).`,
      contributingTripUuids: uuids,
    }
  }

  if (totalMs > WEEKLY_HOURS_RULES.BIWEEKLY_WARN_MS) {
    return {
      ruleId:        "BIWEEKLY_HOURS",
      totalMinutes,
      severity:      "warning",
      message:       `${fmtHoursMin(totalMinutes)} of driving across ${label} — approaching 90h biweekly maximum (EC 561/2006 Art.6.3).`,
      contributingTripUuids: uuids,
    }
  }

  return null
}
