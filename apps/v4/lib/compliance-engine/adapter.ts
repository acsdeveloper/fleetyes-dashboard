/**
 * Compliance Engine — Data Adapter
 * ─────────────────────────────────
 *
 * Bridges between the existing Orders/Trips API data and the compliance
 * engine's DriverRecord format.
 *
 * Key responsibilities:
 *   1. Fetch historical trip data from the Orders API for a rolling window
 *   2. Convert Order objects into Activity[] and WorkingDay[] structures
 *   3. Merge rota-level day statuses (WD/RD/HOL) with actual trip data
 *   4. Fill rest days as full-day REST activities
 *
 * The adapter derives driving time from trip timestamps:
 *   - scheduled_at → estimated_end_date (if available)
 *   - Falls back to scheduled_at + `time` field (seconds)
 *   - Final fallback: assume 8h working day for WD entries without trips
 */

import {
  type DriverRecord,
  type WorkingDay,
  type Activity,
  type VehicleConfig,
  type Ruleset,
  ActivityType,
  VehicleType,
  DEFAULT_VEHICLE_CONFIG,
} from "./types"

import {
  sumDriving,
  sumDuty,
  sumBreaks,
  sumRest,
  spreadover,
  toDateStr,
} from "./utils"

import { type Order, listOrders } from "../orders-api"
import { type RotaEntry, getAllRota } from "../rota-store"
import { type Driver } from "../drivers-api"

// ─── Constants ───────────────────────────────────────────────────────────────

/** Rolling window: evaluation day + 28 preceding days */
const ROLLING_WINDOW_DAYS = 29

/** Default assumed working day length when no trip data is available (minutes) */
const DEFAULT_DUTY_MINUTES = 480  // 8 hours

/** Default assumed driving portion of a working day (minutes) */
const DEFAULT_DRIVING_MINUTES = 360  // 6 hours

/** Minutes of non-driving duty assumed around a trip (pre-trip checks, loading) */
const NON_DRIVING_BUFFER_MINUTES = 30

// ─── Trip → Activity Conversion ──────────────────────────────────────────────

/**
 * Convert a single Order (trip) into a DRIVING activity.
 *
 * Driving duration is derived from:
 *   1. scheduled_at → estimated_end_date (most accurate)
 *   2. scheduled_at + time field (seconds)
 *   3. Fallback: 2 hours estimated
 */
function orderToActivity(order: Order): Activity {
  const startStr = order.scheduled_at ?? order.started_at ?? order.created_at
  const start = new Date(startStr)

  let end: Date

  if (order.estimated_end_date) {
    end = new Date(order.estimated_end_date)
  } else if (order.time && order.time > 0) {
    // `time` is in seconds
    end = new Date(start.getTime() + order.time * 1000)
  } else {
    // Fallback: assume 2 hours
    end = new Date(start.getTime() + 2 * 60 * 60_000)
  }

  return {
    activityType: ActivityType.DRIVING,
    startTime:    start,
    endTime:      end,
    isOffRoad:    false,
    isInternational: false,
  }
}

/**
 * Create a NON_DRIVING_DUTY activity for pre/post-trip work
 * (walk-around checks, loading/unloading, paperwork).
 */
function createNonDrivingBuffer(
  referenceTime: Date,
  before: boolean,
  durationMinutes: number = NON_DRIVING_BUFFER_MINUTES,
): Activity {
  const start = before
    ? new Date(referenceTime.getTime() - durationMinutes * 60_000)
    : referenceTime
  const end = before
    ? referenceTime
    : new Date(referenceTime.getTime() + durationMinutes * 60_000)

  return {
    activityType: ActivityType.NON_DRIVING_DUTY,
    startTime:    start,
    endTime:      end,
  }
}

/**
 * Create a BREAK activity (e.g. 45-minute break for Assimilated compliance).
 * Inserted after each driving activity by default.
 */
function createBreak(afterTime: Date, durationMinutes: number = 45): Activity {
  return {
    activityType: ActivityType.BREAK,
    startTime:    afterTime,
    endTime:      new Date(afterTime.getTime() + durationMinutes * 60_000),
  }
}

// ─── Day Builder ─────────────────────────────────────────────────────────────

/**
 * Build a WorkingDay from a set of orders (trips) for a specific date.
 */
function buildWorkingDayFromTrips(
  driverUuid: string,
  date: string,
  orders: Order[],
  config: VehicleConfig,
): WorkingDay {
  const activities: Activity[] = []

  for (const order of orders) {
    const driving = orderToActivity(order)

    // Add pre-trip non-driving duty
    activities.push(createNonDrivingBuffer(driving.startTime, true, 15))
    // Add driving activity
    activities.push(driving)
    // Add post-trip non-driving duty
    activities.push(createNonDrivingBuffer(driving.endTime, false, 15))
    // Add a 45-minute break after each trip (conservative assumption)
    activities.push(createBreak(
      new Date(driving.endTime.getTime() + 15 * 60_000),
      45,
    ))
  }

  return computeWorkingDay(driverUuid, date, activities, config)
}

/**
 * Build a WorkingDay for a day marked as WD but with no trip data.
 * Uses conservative defaults (8h duty, 6h driving).
 */
function buildDefaultWorkingDay(
  driverUuid: string,
  date: string,
  config: VehicleConfig,
): WorkingDay {
  const dayStart = new Date(date + "T07:00:00")
  const activities: Activity[] = [
    {
      activityType: ActivityType.NON_DRIVING_DUTY,
      startTime:    dayStart,
      endTime:      new Date(dayStart.getTime() + 30 * 60_000),  // 30min pre-trip
    },
    {
      activityType: ActivityType.DRIVING,
      startTime:    new Date(dayStart.getTime() + 30 * 60_000),
      endTime:      new Date(dayStart.getTime() + (30 + DEFAULT_DRIVING_MINUTES) * 60_000),
    },
    {
      activityType: ActivityType.BREAK,
      startTime:    new Date(dayStart.getTime() + (30 + DEFAULT_DRIVING_MINUTES) * 60_000),
      endTime:      new Date(dayStart.getTime() + (30 + DEFAULT_DRIVING_MINUTES + 45) * 60_000),
    },
    {
      activityType: ActivityType.NON_DRIVING_DUTY,
      startTime:    new Date(dayStart.getTime() + (30 + DEFAULT_DRIVING_MINUTES + 45) * 60_000),
      endTime:      new Date(dayStart.getTime() + DEFAULT_DUTY_MINUTES * 60_000),
    },
  ]

  return computeWorkingDay(driverUuid, date, activities, config)
}

/**
 * Build a rest day — full 24h of REST activity.
 */
function buildRestDay(
  driverUuid: string,
  date: string,
  config: VehicleConfig,
): WorkingDay {
  const dayStart = new Date(date + "T00:00:00")
  const dayEnd   = new Date(date + "T23:59:59")

  return computeWorkingDay(driverUuid, date, [{
    activityType: ActivityType.REST,
    startTime:    dayStart,
    endTime:      dayEnd,
  }], config)
}

/**
 * Compute all derived fields for a WorkingDay.
 */
function computeWorkingDay(
  driverUuid: string,
  date: string,
  activities: Activity[],
  config: VehicleConfig,
): WorkingDay {
  const day: WorkingDay = {
    date,
    driverUuid,
    activities,
    vehicleType:         config.vehicleType,
    usageType:           config.usageType,
    vehicleWeightTonnes: config.vehicleWeightTonnes,
    totalDrivingMinutes:     0,
    totalDutyMinutes:        0,
    totalRestMinutes:        0,
    totalBreakMinutes:       0,
    spreadoverMinutes:       0,
    hasDriving:              false,
    isRestDay:               false,
    hasInternationalDriving: false,
  }

  day.totalDrivingMinutes     = sumDriving(day)
  day.totalDutyMinutes        = sumDuty(day)
  day.totalRestMinutes        = sumRest(day)
  day.totalBreakMinutes       = sumBreaks(day)
  day.spreadoverMinutes       = spreadover(day)
  day.hasDriving              = day.totalDrivingMinutes > 0
  day.isRestDay               = !day.hasDriving && day.totalDutyMinutes === 0
  day.hasInternationalDriving = activities.some(
    a => a.activityType === ActivityType.DRIVING && a.isInternational === true
  )

  return day
}

// ─── Ruleset Selection ───────────────────────────────────────────────────────

/**
 * Determine which ruleset applies based on vehicle configuration.
 *
 * For HGV:
 *   - If > 3.5 tonnes → Assimilated rules apply
 *   - If ≤ 3.5 tonnes → GB Domestic Goods rules
 *   - If any international driving → Assimilated rules
 */
export function determineRuleset(config: VehicleConfig): Ruleset {
  if (config.isInternational) return "ASSIMILATED"
  if (config.vehicleWeightTonnes > 3.5) return "ASSIMILATED"
  return "GB_DOMESTIC_GOODS"
}

// ─── Main Adapter ────────────────────────────────────────────────────────────

/**
 * Fetch historical trip data and build a DriverRecord for compliance evaluation.
 *
 * @param driver          The driver to evaluate
 * @param evaluationDate  The date to evaluate from (typically today)
 * @param vehicleConfig   Vehicle classification (weight, type, usage)
 * @returns               A complete DriverRecord ready for the compliance engine
 */
export async function buildDriverRecord(
  driver: Driver,
  evaluationDate: string,
  vehicleConfig: VehicleConfig = DEFAULT_VEHICLE_CONFIG,
): Promise<DriverRecord> {
  // Calculate the 29-day window
  const evalDate = new Date(evaluationDate + "T12:00:00")
  const windowStart = new Date(
    evalDate.getFullYear(),
    evalDate.getMonth(),
    evalDate.getDate() - (ROLLING_WINDOW_DAYS - 1),
  )
  const startStr = toDateStr(windowStart)

  // Fetch all orders for this driver in the window
  let orders: Order[] = []
  try {
    const res = await listOrders({
      driver:       driver.uuid,
      scheduled_at: startStr,
      end_date:     evaluationDate,
      per_page:     500,
      sort:         "scheduled_at",
    })
    orders = res.orders ?? []
  } catch {
    // If API fails, proceed with empty orders — record-keeping will flag gaps
    orders = []
  }

  // Get rota entries for context (WD/RD/HOL assignments)
  const allRota = getAllRota().filter(r => r.driver_uuid === driver.uuid)
  const rotaMap = new Map<string, RotaEntry>()
  for (const r of allRota) {
    rotaMap.set(r.date, r)
  }

  // Index orders by local date
  const ordersByDate = new Map<string, Order[]>()
  for (const o of orders) {
    const dateStr = o.scheduled_at
      ? toLocalDateStr(new Date(o.scheduled_at))
      : o.created_at
      ? toLocalDateStr(new Date(o.created_at))
      : null
    if (!dateStr) continue
    const existing = ordersByDate.get(dateStr) ?? []
    existing.push(o)
    ordersByDate.set(dateStr, existing)
  }

  // Build working days for every date in the window
  const workingDays: WorkingDay[] = []

  for (let i = 0; i < ROLLING_WINDOW_DAYS; i++) {
    const d = new Date(
      windowStart.getFullYear(),
      windowStart.getMonth(),
      windowStart.getDate() + i,
    )
    const dateStr = toDateStr(d)
    const dayOrders = ordersByDate.get(dateStr) ?? []
    const rota = rotaMap.get(dateStr)

    if (dayOrders.length > 0) {
      // We have actual trip data — build from orders
      workingDays.push(buildWorkingDayFromTrips(
        driver.uuid, dateStr, dayOrders, vehicleConfig,
      ))
    } else if (rota?.status === "WD") {
      // Rota says working day but no trips — use defaults
      workingDays.push(buildDefaultWorkingDay(
        driver.uuid, dateStr, vehicleConfig,
      ))
    } else if (rota?.status === "RD" || rota?.status === "HOL_REQ" || rota?.status === "OFF") {
      // Explicitly marked as rest/holiday/off
      workingDays.push(buildRestDay(driver.uuid, dateStr, vehicleConfig))
    } else {
      // No rota entry and no trips — assume rest day
      // (record-keeping validator will flag gaps if needed)
      workingDays.push(buildRestDay(driver.uuid, dateStr, vehicleConfig))
    }
  }

  // Sort chronologically
  workingDays.sort((a, b) => a.date.localeCompare(b.date))

  return {
    driverUuid:       driver.uuid,
    driverName:       driver.name,
    workingDays,
    applicableRuleset: determineRuleset(vehicleConfig),
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
