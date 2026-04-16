/**
 * Shift Hours Derivation
 *
 * Trips are stored as raw time-blocks (scheduled_at → estimated_end_date).
 * These blocks include non-driving time (breaks, loading, paperwork, etc.).
 * To get meaningful compliance figures we derive:
 *
 *   - workingHours  = hours the driver is considered "on duty"
 *   - drivingHours  = hours the driver is considered "behind the wheel"
 *
 * Rules (agreed with operations, pending API field):
 *
 *   Single-day block  (block length ≤ MULTIDAY_THRESHOLD_H hours):
 *     working = block − SINGLE_DAY_WORKING_REDUCTION_H
 *     driving = block − SINGLE_DAY_DRIVING_REDUCTION_H
 *
 *   Multi-day block   (block spans midnight OR length > MULTIDAY_THRESHOLD_H):
 *     working = MULTIDAY_WORKING_H  (fixed)
 *     driving = MULTIDAY_DRIVING_H  (fixed)
 *
 * Values are intentionally conservative — remove more non-driving time than
 * actually present so compliance bars show headroom, not false violations.
 */

// ─── Thresholds ───────────────────────────────────────────────────────────────

/**
 * Single-day block length above which we switch to multi-day assumptions.
 * A "normal" long single-day shift is ~12h. Anything beyond 15h is almost
 * certainly a multi-day trip where the driver has a mandatory rest embedded.
 */
export const MULTIDAY_THRESHOLD_H = 15

/** Working time deduction for a typical single-day block (breaks, loading…) */
export const SINGLE_DAY_WORKING_REDUCTION_H = 1

/** Driving time deduction for a typical single-day block (stops, breaks…) */
export const SINGLE_DAY_DRIVING_REDUCTION_H = 3.5

/** Fixed assumed working hours for a multi-day trip */
export const MULTIDAY_WORKING_H = 11

/** Fixed assumed driving hours for a multi-day trip */
export const MULTIDAY_DRIVING_H = 9

// ─── Helper ───────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ShiftHours {
  /** Estimated hours the driver was actively on duty */
  workingHours: number
  /** Estimated hours the driver was behind the wheel */
  drivingHours: number
  /** Whether multi-day assumptions were applied */
  isMultiDay: boolean
  /** Raw block length in hours (for display/debugging) */
  blockHours: number
}

/**
 * Derive working and driving hours for a single trip/shift block.
 *
 * @param startTime  Trip start (scheduled_at)
 * @param endTime    Trip end   (estimated_end_date or fallback)
 */
export function shiftHours(startTime: Date, endTime: Date): ShiftHours {
  const blockMs    = Math.max(0, endTime.getTime() - startTime.getTime())
  const blockHours = blockMs / 3_600_000

  // Multi-day: spans midnight, or block > threshold
  const spansDay = toLocalDateStr(startTime) !== toLocalDateStr(endTime)
  const isMultiDay = spansDay || blockHours > MULTIDAY_THRESHOLD_H

  if (isMultiDay) {
    return {
      workingHours: MULTIDAY_WORKING_H,
      drivingHours: MULTIDAY_DRIVING_H,
      isMultiDay:   true,
      blockHours,
    }
  }

  const workingHours = Math.max(0, blockHours - SINGLE_DAY_WORKING_REDUCTION_H)
  const drivingHours = Math.max(0, blockHours - SINGLE_DAY_DRIVING_REDUCTION_H)

  return { workingHours, drivingHours, isMultiDay: false, blockHours }
}

/**
 * Convenience: total working milliseconds across a set of trips.
 * Used by weekly / biweekly hours stats.
 */
export function totalWorkingMs(trips: { startTime: Date; endTime: Date }[]): number {
  return trips.reduce((sum, t) => sum + shiftHours(t.startTime, t.endTime).workingHours * 3_600_000, 0)
}

/**
 * Convenience: total driving milliseconds across a set of trips.
 * Used by daily / continuous driving stats.
 */
export function totalDrivingMs(trips: { startTime: Date; endTime: Date }[]): number {
  return trips.reduce((sum, t) => sum + shiftHours(t.startTime, t.endTime).drivingHours * 3_600_000, 0)
}
