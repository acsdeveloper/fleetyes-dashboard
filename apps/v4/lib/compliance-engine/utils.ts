/**
 * Compliance Engine — Shared Utilities
 * ─────────────────────────────────────
 *
 * Pure helper functions for time arithmetic, week boundary calculation,
 * and activity analysis.  Used by all three validation modules.
 */

import {
  type Activity,
  type WorkingDay,
  ActivityType,
} from "./types"

// ─── Time Math ───────────────────────────────────────────────────────────────

/** Duration of an activity in minutes */
export function activityMinutes(a: Activity): number {
  return Math.max(0, (a.endTime.getTime() - a.startTime.getTime()) / 60_000)
}

/** Format minutes as "Xh Ym" for human-readable output */
export function fmtMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Convert hours to minutes */
export function hoursToMinutes(h: number): number {
  return h * 60
}

// ─── Activity Summaries ──────────────────────────────────────────────────────

/** Sum total driving minutes for a working day */
export function sumDriving(day: WorkingDay): number {
  return day.activities
    .filter(a => a.activityType === ActivityType.DRIVING)
    .reduce((sum, a) => sum + activityMinutes(a), 0)
}

/** Sum total duty minutes (driving + non-driving duty, NOT breaks/rest) */
export function sumDuty(day: WorkingDay): number {
  return day.activities
    .filter(a =>
      a.activityType === ActivityType.DRIVING ||
      a.activityType === ActivityType.NON_DRIVING_DUTY
    )
    .reduce((sum, a) => sum + activityMinutes(a), 0)
}

/** Sum total break minutes */
export function sumBreaks(day: WorkingDay): number {
  return day.activities
    .filter(a => a.activityType === ActivityType.BREAK)
    .reduce((sum, a) => sum + activityMinutes(a), 0)
}

/** Sum total rest minutes */
export function sumRest(day: WorkingDay): number {
  return day.activities
    .filter(a => a.activityType === ActivityType.REST)
    .reduce((sum, a) => sum + activityMinutes(a), 0)
}

/**
 * Calculate spreadover: time from the first activity start to the last
 * activity end (in minutes).  Returns 0 if no activities.
 */
export function spreadover(day: WorkingDay): number {
  if (day.activities.length === 0) return 0
  const sorted = [...day.activities].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )
  const first = sorted[0].startTime.getTime()
  const last  = sorted[sorted.length - 1].endTime.getTime()
  return Math.max(0, (last - first) / 60_000)
}

// ─── Off-Road Driving Filter ─────────────────────────────────────────────────

/**
 * Sum driving minutes that COUNT toward the daily limit.
 *
 * For GB Domestic Goods: off-road driving only counts if the vehicle
 * is used for agriculture, quarrying, forestry, building work, or
 * civil engineering.
 *
 * @param day              The working day
 * @param countOffRoad     Whether off-road driving counts (depends on UsageType)
 */
export function sumCountableDriving(day: WorkingDay, countOffRoad: boolean): number {
  return day.activities
    .filter(a => {
      if (a.activityType !== ActivityType.DRIVING) return false
      // If off-road and we shouldn't count it, skip
      if (a.isOffRoad && !countOffRoad) return false
      return true
    })
    .reduce((sum, a) => sum + activityMinutes(a), 0)
}

// ─── Week / Date Boundaries ──────────────────────────────────────────────────

/**
 * Get the Monday of the ISO week containing a given date string.
 * ISO weeks run Mon–Sun.
 */
export function isoWeekMonday(dateStr: string): Date {
  const d = new Date(dateStr + "T12:00:00")   // noon to avoid DST edge
  const day = d.getDay()                       // 0=Sun, 1=Mon, …, 6=Sat
  const diff = day === 0 ? -6 : 1 - day       // Mon=0, Tue=-1, …, Sun=-6
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff)
}

/**
 * Generate an array of consecutive date strings starting from `startDate`
 * for `count` days.
 */
export function dateRange(startDate: string, count: number): string[] {
  const result: string[] = []
  const d = new Date(startDate + "T12:00:00")
  for (let i = 0; i < count; i++) {
    const cur = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i)
    result.push(toDateStr(cur))
  }
  return result
}

/** Format a Date as "YYYY-MM-DD" in local time */
export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Get working days within a date range (inclusive).
 */
export function daysInRange(
  days: WorkingDay[],
  startDate: string,
  endDate: string,
): WorkingDay[] {
  return days.filter(d => d.date >= startDate && d.date <= endDate)
}

/**
 * Get the ISO week number for a date.
 */
export function getISOWeekNumber(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00")
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86_400_000
  ) + 1
  const dayOfWeek = d.getDay() || 7  // Mon=1 … Sun=7
  return Math.ceil((dayOfYear - dayOfWeek + 10) / 7)
}

// ─── Rest Period Analysis ────────────────────────────────────────────────────

/**
 * Calculate the rest period BETWEEN two consecutive working days.
 *
 * Rest = time from the end of the last activity on dayA to the start
 * of the first activity on dayB.  Returns minutes.
 */
export function restBetweenDays(dayA: WorkingDay, dayB: WorkingDay): number {
  if (dayA.activities.length === 0 || dayB.activities.length === 0) return 0

  const sortedA = [...dayA.activities].sort(
    (a, b) => a.endTime.getTime() - b.endTime.getTime()
  )
  const sortedB = [...dayB.activities].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  const endA   = sortedA[sortedA.length - 1].endTime.getTime()
  const startB = sortedB[0].startTime.getTime()

  return Math.max(0, (startB - endA) / 60_000)
}

/**
 * Find the longest continuous break within a day's activities.
 * "Continuous" means a single uninterrupted BREAK activity.
 */
export function longestContinuousBreak(day: WorkingDay): number {
  return day.activities
    .filter(a => a.activityType === ActivityType.BREAK)
    .reduce((max, a) => Math.max(max, activityMinutes(a)), 0)
}

/**
 * Find the longest continuous rest period in a sequence of days.
 * This scans for the largest gap between duty activities.
 */
export function longestContinuousRest(days: WorkingDay[]): number {
  if (days.length === 0) return 0

  // Collect ALL non-rest activities across all days, sorted by time
  const allActivities = days
    .flatMap(d => d.activities)
    .filter(a =>
      a.activityType === ActivityType.DRIVING ||
      a.activityType === ActivityType.NON_DRIVING_DUTY
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  if (allActivities.length === 0) {
    // No duty at all — entire span is rest
    const firstDate = days[0].date
    const lastDate  = days[days.length - 1].date
    const span = (new Date(lastDate + "T23:59:59").getTime() -
                  new Date(firstDate + "T00:00:00").getTime()) / 60_000
    return span
  }

  let maxGap = 0

  // Gap before first activity
  const firstStart = allActivities[0].startTime.getTime()
  const spanStart  = new Date(days[0].date + "T00:00:00").getTime()
  maxGap = Math.max(maxGap, (firstStart - spanStart) / 60_000)

  // Gaps between consecutive activities
  for (let i = 1; i < allActivities.length; i++) {
    const prevEnd    = allActivities[i - 1].endTime.getTime()
    const nextStart  = allActivities[i].startTime.getTime()
    maxGap = Math.max(maxGap, (nextStart - prevEnd) / 60_000)
  }

  // Gap after last activity
  const lastEnd  = allActivities[allActivities.length - 1].endTime.getTime()
  const spanEnd  = new Date(days[days.length - 1].date + "T23:59:59").getTime()
  maxGap = Math.max(maxGap, (spanEnd - lastEnd) / 60_000)

  return maxGap
}

// ─── Break Pattern Analysis ──────────────────────────────────────────────────

/**
 * Analyse breaks taken during a driving period.
 *
 * For Assimilated rules: after 4.5h of driving, driver must take >= 45min
 * break.  The break can be split as 15min + 30min (in that order).
 *
 * Returns an object describing the break pattern.
 */
export interface BreakPatternResult {
  /** Accumulated driving since last qualifying break (minutes) */
  drivingSinceLastBreak: number
  /** Whether the break rules are satisfied */
  isSatisfied:           boolean
  /** Description of the violation (if any) */
  description?:          string
}

/**
 * Check Assimilated break rules: 45min break after max 4.5h driving.
 * Break can be split into 15min + 30min.
 */
export function checkAssimilatedBreaks(day: WorkingDay): BreakPatternResult {
  const maxDrivingBeforeBreak = hoursToMinutes(4.5)  // 270 min
  const requiredBreak         = 45                     // minutes
  const sorted = [...day.activities].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  let accumulatedDriving = 0
  let accumulatedBreak   = 0
  let worstDrivingStretch = 0

  for (const activity of sorted) {
    if (activity.activityType === ActivityType.DRIVING) {
      accumulatedDriving += activityMinutes(activity)
      worstDrivingStretch = Math.max(worstDrivingStretch, accumulatedDriving)
    } else if (activity.activityType === ActivityType.BREAK) {
      const breakLen = activityMinutes(activity)
      accumulatedBreak += breakLen

      // A qualifying break resets the driving counter
      // Split break: first part >= 15min, then >= 30min (total >= 45min)
      // OR a single break >= 45min
      if (accumulatedBreak >= requiredBreak) {
        accumulatedDriving = 0
        accumulatedBreak   = 0
      }
    }
    // REST also resets counters
    else if (activity.activityType === ActivityType.REST) {
      accumulatedDriving = 0
      accumulatedBreak   = 0
    }
  }

  const violated = worstDrivingStretch > maxDrivingBeforeBreak
  return {
    drivingSinceLastBreak: accumulatedDriving,
    isSatisfied: !violated,
    description: violated
      ? `Drove ${fmtMinutes(worstDrivingStretch)} without a qualifying 45-minute break (max 4h 30m)`
      : undefined,
  }
}

/**
 * Check GB Domestic Passenger break rules.
 *
 * If total duty < 8.5h:
 *   Require >= 30min break after 5.5h of driving.
 *
 * If total duty >= 8.5h:
 *   Either:
 *     (a) >= 30min break after 5.5h of driving, OR
 *     (b) >= 45min of non-driving time in the first 8.5h,
 *         followed by a >= 30min break.
 *         (If the 45min includes a continuous 30min break, the later break is waived.)
 */
export function checkPassengerBreaks(day: WorkingDay): BreakPatternResult {
  const totalDuty = day.totalDutyMinutes
  const sorted = [...day.activities].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  // Check rule (a): 30min break after 5.5h driving
  const maxDrivingBeforeBreak = hoursToMinutes(5.5)  // 330 min
  let accDriving = 0
  let has30minBreakAfter5h5 = true
  let worstStretch = 0

  for (const activity of sorted) {
    if (activity.activityType === ActivityType.DRIVING) {
      accDriving += activityMinutes(activity)
      worstStretch = Math.max(worstStretch, accDriving)
    } else if (
      activity.activityType === ActivityType.BREAK &&
      activityMinutes(activity) >= 30
    ) {
      accDriving = 0  // qualifying break resets
    } else if (activity.activityType === ActivityType.REST) {
      accDriving = 0
    }
  }
  has30minBreakAfter5h5 = worstStretch <= maxDrivingBeforeBreak

  if (totalDuty < hoursToMinutes(8.5)) {
    // Short duty: simple 30min break after 5.5h rule
    return {
      drivingSinceLastBreak: accDriving,
      isSatisfied: has30minBreakAfter5h5,
      description: !has30minBreakAfter5h5
        ? `Drove ${fmtMinutes(worstStretch)} without a 30-minute break (max 5h 30m for short duty days)`
        : undefined,
    }
  }

  // Long duty (>= 8.5h): check alternative rule (b)
  // 45min non-driving time in first 8.5h
  if (has30minBreakAfter5h5) {
    return { drivingSinceLastBreak: accDriving, isSatisfied: true }
  }

  // Check rule (b): 45min of non-driving time in first 8.5h
  const dayStart = sorted.length > 0 ? sorted[0].startTime.getTime() : 0
  const first8h5End = dayStart + hoursToMinutes(8.5) * 60_000
  let nonDrivingInFirst8h5 = 0
  let longestBreakInFirst8h5 = 0

  for (const activity of sorted) {
    if (activity.startTime.getTime() >= first8h5End) break
    if (
      activity.activityType === ActivityType.BREAK ||
      activity.activityType === ActivityType.NON_DRIVING_DUTY
    ) {
      const effectiveEnd = Math.min(activity.endTime.getTime(), first8h5End)
      const mins = (effectiveEnd - activity.startTime.getTime()) / 60_000
      nonDrivingInFirst8h5 += mins
      if (activity.activityType === ActivityType.BREAK) {
        longestBreakInFirst8h5 = Math.max(longestBreakInFirst8h5, mins)
      }
    }
  }

  const has45minNonDriving = nonDrivingInFirst8h5 >= 45
  const has30minContinuousBreak = longestBreakInFirst8h5 >= 30

  // If 45min non-driving AND it includes a 30min continuous break,
  // the later 30min break requirement is waived
  if (has45minNonDriving && has30minContinuousBreak) {
    return { drivingSinceLastBreak: accDriving, isSatisfied: true }
  }

  // If 45min non-driving but no 30min continuous break,
  // still need a 30min break later
  if (has45minNonDriving) {
    // Check if there's a 30min break AFTER the first 8.5h
    const laterBreaks = sorted.filter(
      a => a.startTime.getTime() >= first8h5End &&
           a.activityType === ActivityType.BREAK &&
           activityMinutes(a) >= 30
    )
    if (laterBreaks.length > 0) {
      return { drivingSinceLastBreak: accDriving, isSatisfied: true }
    }
  }

  return {
    drivingSinceLastBreak: accDriving,
    isSatisfied: false,
    description: `Long duty day (${fmtMinutes(totalDuty)}): break requirements not met. Need 30min break after 5h30m driving, or 45min non-driving in first 8h30m.`,
  }
}
