/**
 * Weekly Rest Logic — EC 561/2006 Article 8.6
 *
 * Pure function — no API or UI dependencies.
 *
 * Every driver must take at least one unbroken rest period per 7-day period:
 *   Regular weekly rest:  ≥ 45h  → compliant
 *   Reduced weekly rest:  ≥ 24h  → warning (compensation required within 3 weeks)
 *   No weekly rest:       < 24h  → violation
 *
 * Implementation strategy:
 *   - Sort all trips by startTime
 *   - Find the longest gap between any consecutive trip.endTime → trip.startTime
 *   - Compare that maximum gap against the thresholds above
 *
 * Notes:
 *   - Only checked when driver has ≥ 2 trips (single trip ⇒ no inter-trip gap to check)
 *   - The violation is attributed to the last day of the week (Saturday) since that
 *     is when the weekly rest deadline is reached
 *   - This check is separate from REST_GAP (inter-trip minimum 9h) — this rule
 *     asks: was there at least ONE long rest anywhere in the 7-day period?
 */

export const WEEKLY_REST_RULES = {
  REGULAR_REST_HOURS:  45,
  REDUCED_REST_HOURS:  24,
  REGULAR_REST_MS:     45 * 3600 * 1000,
  REDUCED_REST_MS:     24 * 3600 * 1000,
} as const

export type WeeklyRestSeverity = "violation" | "warning"

export interface WeeklyRestResult {
  /** Longest gap found between any two consecutive trips (minutes) */
  longestGapMinutes: number
  severity:          WeeklyRestSeverity
  message:           string
  /** UUID of the trip after the longest gap (the return-to-work trip) */
  tripAfterRestUuid: string
  /** UUID of the trip before the longest gap (the last trip before rest) */
  tripBeforeRestUuid: string
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
 * Find the weekly rest gap for a set of trips.
 *
 * @param trips  All trips for a single driver in the week window (any order)
 * @returns      Result if the best gap is below the regular threshold; null if compliant
 */
export function findWeeklyRestViolation(trips: TripWindow[]): WeeklyRestResult | null {
  if (trips.length < 2) return null  // single trip → no inter-trip gap to check

  // Sort by start time
  const sorted = [...trips].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  // Find the largest gap between consecutive trips
  let maxGapMs = 0
  let bestI    = 0

  for (let i = 0; i < sorted.length - 1; i++) {
    const gapMs = sorted[i + 1].startTime.getTime() - sorted[i].endTime.getTime()
    if (gapMs > maxGapMs) {
      maxGapMs = gapMs
      bestI    = i
    }
  }

  // If the best gap satisfies regular weekly rest → compliant
  if (maxGapMs >= WEEKLY_REST_RULES.REGULAR_REST_MS) return null

  const longestGapMinutes = maxGapMs / 60000
  const tripBefore = sorted[bestI]
  const tripAfter  = sorted[bestI + 1]

  if (maxGapMs >= WEEKLY_REST_RULES.REDUCED_REST_MS) {
    return {
      longestGapMinutes,
      severity:           "warning",
      message:            `Longest rest this week was ${fmtHoursMin(longestGapMinutes)} — below 45h regular weekly rest (EC 561/2006 Art.8.6). Reduced rest (≥24h) requires compensation within 3 weeks.`,
      tripBeforeRestUuid: tripBefore.orderId,
      tripAfterRestUuid:  tripAfter.orderId,
    }
  }

  return {
    longestGapMinutes,
    severity:           "violation",
    message:            `Longest rest this week was only ${fmtHoursMin(longestGapMinutes)} — below 24h minimum weekly rest (EC 561/2006 Art.8.6). A valid weekly rest period is required every 7 days.`,
    tripBeforeRestUuid: tripBefore.orderId,
    tripAfterRestUuid:  tripAfter.orderId,
  }
}
