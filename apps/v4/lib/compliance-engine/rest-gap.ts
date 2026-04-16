/**
 * Rest Gap Rule — EC 561/2006 (UK/EU HGV)
 *
 * Given a sorted list of trips for a single driver, check every consecutive
 * pair for minimum rest periods between them.
 *
 * Rules:
 *   gap < 9h   → VIOLATION  (illegal — below absolute minimum)
 *   9h ≤ gap < 11h → WARNING  (reduced daily rest — allowed max 3× per week)
 *   gap ≥ 11h  → compliant
 *
 * "Gap" = tripB.startTime − tripA.endTime  (time between end of one and start of next)
 * Only consecutive pairs (sorted by start time) are tested.
 */

export const REST_GAP_RULES = {
  MIN_REST_HOURS: 9,    // legal minimum (reduced rest)
  STD_REST_HOURS: 11,   // standard daily rest
  MIN_REST_MS:    9  * 60 * 60 * 1000,
  STD_REST_MS:    11 * 60 * 60 * 1000,
} as const

export type RestGapSeverity = "violation" | "warning"

export interface RestGapResult {
  tripAUuid:    string
  tripBUuid:    string
  gapMinutes:   number
  severity:     RestGapSeverity
  /** YYYY-MM-DD when the gap occurs (date tripB starts) */
  date:         string
  message:      string
}

interface TripWindow {
  orderId:   string
  startTime: Date
  endTime:   Date
}

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function fmtHours(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Find rest-gap violations and warnings for a set of trips.
 *
 * @param trips  Array of trips for a single driver (any order — sorted internally)
 * @returns      Array of RestGapResult, one per consecutive pair with an issue
 */
export function findRestGapViolations(trips: TripWindow[]): RestGapResult[] {
  if (trips.length < 2) return []

  // Sort ascending by start time
  const sorted = [...trips].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  const results: RestGapResult[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]

    const gapMs      = b.startTime.getTime() - a.endTime.getTime()
    const gapMinutes = gapMs / 60000

    // Overlapping trips are handled by the overlap detector — skip negative gaps here
    if (gapMs <= 0) continue

    if (gapMs < REST_GAP_RULES.MIN_REST_MS) {
      // Strictly below 9h — illegal violation
      results.push({
        tripAUuid:  a.orderId,
        tripBUuid:  b.orderId,
        gapMinutes,
        severity:   "violation",
        date:       toLocalDate(b.startTime),
        message:    `Only ${fmtHours(gapMs)} rest between trips (minimum 9h required by EC 561/2006). Driver needs at least ${fmtHours(REST_GAP_RULES.MIN_REST_MS - gapMs)} more rest.`,
      })
    } else if (gapMs > REST_GAP_RULES.MIN_REST_MS && gapMs < REST_GAP_RULES.STD_REST_MS) {
      // Strictly between 9h and 11h — reduced rest (warning)
      // Exactly 9h is the legal minimum and is compliant.
      results.push({
        tripAUuid:  a.orderId,
        tripBUuid:  b.orderId,
        gapMinutes,
        severity:   "warning",
        date:       toLocalDate(b.startTime),
        message:    `${fmtHours(gapMs)} rest between trips (reduced rest — allowed max 3× per week, standard is 11h).`,
      })
    }
    // ≥ 11h → compliant, no entry
  }

  return results
}
