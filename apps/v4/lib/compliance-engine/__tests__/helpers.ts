/**
 * Test Helpers — Compliance Engine
 * ─────────────────────────────────
 *
 * Factory functions for building mock Activity, WorkingDay, and DriverRecord
 * objects for use in compliance engine unit tests.
 */

import {
  type Activity,
  type WorkingDay,
  type DriverRecord,
  type Ruleset,
  ActivityType,
  VehicleType,
  UsageType,
} from "../types"

import {
  sumDriving,
  sumBreaks,
  sumRest,
  spreadover,
  mergedDutyMinutes,
} from "../utils"

const DEFAULT_DRIVER_UUID = "test-driver-001"

/**
 * Create an Activity with convenient time shorthand.
 * Times are on the given date in format "HH:MM".
 */
export function makeActivity(
  date: string,
  startHHMM: string,
  endHHMM: string,
  type: ActivityType = ActivityType.NON_DRIVING_DUTY,
): Activity {
  return {
    activityType: type,
    startTime: new Date(`${date}T${startHHMM}:00`),
    endTime: new Date(`${date}T${endHHMM}:00`),
  }
}

/**
 * Create an Activity that spans across midnight.
 * startDate + startHHMM → endDate + endHHMM
 */
export function makeOvernightActivity(
  startDate: string,
  startHHMM: string,
  endDate: string,
  endHHMM: string,
  type: ActivityType = ActivityType.NON_DRIVING_DUTY,
): Activity {
  return {
    activityType: type,
    startTime: new Date(`${startDate}T${startHHMM}:00`),
    endTime: new Date(`${endDate}T${endHHMM}:00`),
  }
}

/**
 * Create a WorkingDay with activities and computed summaries.
 */
export function makeWorkingDay(
  date: string,
  activities: Activity[],
  driverUuid: string = DEFAULT_DRIVER_UUID,
): WorkingDay {
  const day: WorkingDay = {
    date,
    driverUuid,
    activities,
    vehicleType: VehicleType.GOODS,
    usageType: UsageType.STANDARD,
    vehicleWeightTonnes: 7.5,
    totalDrivingMinutes: 0,
    totalDutyMinutes: 0,
    totalRestMinutes: 0,
    totalBreakMinutes: 0,
    spreadoverMinutes: 0,
    hasDriving: false,
    isRestDay: false,
    hasInternationalDriving: false,
  }

  day.totalDrivingMinutes = sumDriving(day)
  day.totalDutyMinutes = mergedDutyMinutes(day.activities)
  day.totalRestMinutes = sumRest(day)
  day.totalBreakMinutes = sumBreaks(day)
  day.spreadoverMinutes = spreadover(day)
  day.hasDriving = day.totalDrivingMinutes > 0
  day.isRestDay = !day.hasDriving && day.totalDutyMinutes === 0

  return day
}

/**
 * Create a rest day (full 24h REST activity).
 */
export function makeRestDay(
  date: string,
  driverUuid: string = DEFAULT_DRIVER_UUID,
): WorkingDay {
  return makeWorkingDay(date, [{
    activityType: ActivityType.REST,
    startTime: new Date(`${date}T00:00:00`),
    endTime: new Date(`${date}T23:59:59`),
  }], driverUuid)
}

/**
 * Create a DriverRecord from an array of WorkingDays.
 * tripCount defaults to the number of non-rest working days (1 per distinct
 * trip in test scenarios). Pass an explicit value to test guard behaviour.
 */
export function makeDriverRecord(
  workingDays: WorkingDay[],
  driverUuid: string = DEFAULT_DRIVER_UUID,
  ruleset: Ruleset = "ASSIMILATED",
  tripCount?: number,
): DriverRecord {
  const nonRestDays = workingDays.filter(d => !d.isRestDay && d.totalDutyMinutes > 0).length
  return {
    driverUuid,
    driverName: "Test Driver",
    workingDays: [...workingDays].sort((a, b) => a.date.localeCompare(b.date)),
    applicableRuleset: ruleset,
    tripCount: tripCount ?? nonRestDays,
  }
}
