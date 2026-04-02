/**
 * Daily Hours Logic — EC 561/2006 Article 6
 *
 * Pure function — no API or UI dependencies.
 *
 * For each calendar day, calculate how many hours of trip time a driver has.
 * Trips that span midnight are clipped to day boundaries so hours are
 * attributed accurately (e.g. a 23:00–07:00 trip contributes 1h to day 1
 * and 7h to day 2).
 *
 * Thresholds:
 *   > 9h on a day  → warning  (standard daily limit exceeded)
 *   > 10h on a day → violation (absolute maximum exceeded; legal only 2× per week)
 */

export const DAILY_HOURS_RULES = {
  STD_MAX_HOURS:  9,
  ABS_MAX_HOURS:  10,
  STD_MAX_MS:     9  * 60 * 60 * 1000,
  ABS_MAX_MS:     10 * 60 * 60 * 1000,
} as const

export type DailyHoursSeverity = "violation" | "warning"

export interface DailyHoursResult {
  date:            string   // YYYY-MM-DD
  totalMinutes:    number
  severity:        DailyHoursSeverity
  message:         string
  /** UUIDs of trips that contributed hours to this day */
  contributingTripUuids: string[]
}

interface TripWindow {
  orderId:   string
  startTime: Date
  endTime:   Date
}

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Returns midnight (00:00:00.000) of the given local date string */
function dayStart(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00")
}

/** Returns end of day (23:59:59.999) of the given local date string */
function dayEnd(dateStr: string): Date {
  return new Date(dateStr + "T23:59:59.999")
}

function fmtHoursMin(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Get all calendar dates a trip spans (as YYYY-MM-DD strings).
 * A trip from Mon 23:00 to Wed 07:00 spans: Mon, Tue, Wed.
 */
function tripDays(trip: TripWindow): string[] {
  const days: string[] = []
  const startDate = toLocalDate(trip.startTime)
  const endDate   = toLocalDate(trip.endTime)
  if (startDate === endDate) return [startDate]

  const cur = new Date(trip.startTime.getFullYear(), trip.startTime.getMonth(), trip.startTime.getDate())
  const endDay = new Date(trip.endTime.getFullYear(), trip.endTime.getMonth(), trip.endTime.getDate())

  while (cur <= endDay) {
    days.push(toLocalDate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

/**
 * Calculate trip hours clipped to a specific calendar day in milliseconds.
 * Clips trip start/end to [day 00:00, day 23:59:59.999].
 */
function msDuringDay(trip: TripWindow, dateStr: string): number {
  const dayS = dayStart(dateStr).getTime()
  const dayE = dayEnd(dateStr).getTime()
  const clippedStart = Math.max(trip.startTime.getTime(), dayS)
  const clippedEnd   = Math.min(trip.endTime.getTime(), dayE)
  return Math.max(0, clippedEnd - clippedStart)
}

/**
 * Check daily hours for a set of trips.
 *
 * @param trips  All trips for a single driver (any order)
 * @returns      One result per calendar day that exceeds the standard limit
 */
export function findDailyHoursViolations(trips: TripWindow[]): DailyHoursResult[] {
  if (trips.length === 0) return []

  // Build a map: date → { totalMs, tripUuids[] }
  const dayMap = new Map<string, { totalMs: number; uuids: string[] }>()

  for (const trip of trips) {
    for (const date of tripDays(trip)) {
      const ms = msDuringDay(trip, date)
      if (ms <= 0) continue
      const existing = dayMap.get(date) ?? { totalMs: 0, uuids: [] }
      dayMap.set(date, {
        totalMs: existing.totalMs + ms,
        uuids:   [...existing.uuids, trip.orderId],
      })
    }
  }

  const results: DailyHoursResult[] = []

  dayMap.forEach(({ totalMs, uuids }, date) => {
    const totalMinutes = totalMs / 60000

    if (totalMs > DAILY_HOURS_RULES.ABS_MAX_MS) {
      results.push({
        date,
        totalMinutes,
        severity: "violation",
        message:  `${fmtHoursMin(totalMinutes)} of driving on ${date} — exceeds legal 10h daily maximum (EC 561/2006 Art.6). Allowed only twice per week with 9h standard limit.`,
        contributingTripUuids: uuids,
      })
    } else if (totalMs > DAILY_HOURS_RULES.STD_MAX_MS) {
      results.push({
        date,
        totalMinutes,
        severity: "warning",
        message:  `${fmtHoursMin(totalMinutes)} of driving on ${date} — exceeds 9h standard daily limit (EC 561/2006 Art.6). Maximum is 10h, allowed only twice per week.`,
        contributingTripUuids: uuids,
      })
    }
  })

  return results
}
