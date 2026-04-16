/**
 * Tests — Weekly Hours (EC 561/2006 Art.6.3)
 *
 * Weekly limit: 50h warning, 56h violation
 * Biweekly limit: 80h warning, 90h violation
 *
 * Scenarios (weekly):
 *   A. 40h total → compliant
 *   B. Exactly 50h → compliant (at warning threshold, not over)
 *   C. 50h 1m → warning
 *   D. Exactly 56h → warning (at limit, not over)
 *   E. 56h 1m → violation
 *   F. 70h total → violation
 *   G. Multiple short trips summing to 52h → warning
 *   H. Empty trips → null (no result)
 *
 * Scenarios (biweekly):
 *   I.  Week1=44h + Week2=44h = 88h → warning
 *   J.  Week1=50h + Week2=41h = 91h → violation
 *   K.  Week1=44h + Week2=44h = exactly 80h → warning (at threshold)
 *   L.  Both weeks empty → null
 *   M.  Week1=28h + Week2=28h = 56h → compliant
 */

import { describe, it, expect } from "vitest"
import { checkWeeklyHours, checkBiweeklyHours } from "../weekly-hours"

// Helper: build trip with given duration in hours
function tripOfHours(id: string, startIso: string, hours: number) {
  const start = new Date(startIso)
  const end   = new Date(start.getTime() + hours * 3600 * 1000)
  return { orderId: id, startTime: start, endTime: end }
}

const BASE = "2026-04-06T06:00:00"  // Monday 06:00

// Build N trips of H hours each starting at intervals
function buildTrips(count: number, hoursEach: number, startIso = BASE) {
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(new Date(startIso).getTime() + i * (hoursEach + 2) * 3600000)
    return tripOfHours(`T${i + 1}`, start.toISOString(), hoursEach)
  })
}

describe("checkWeeklyHours", () => {

  // A. 40h → compliant
  it("A: 40h total → compliant (null)", () => {
    const trips = buildTrips(5, 8)  // 5 × 8h = 40h
    expect(checkWeeklyHours(trips, "w/c 6 Apr")).toBeNull()
  })

  // B. Exactly 50h → compliant
  it("B: exactly 50h → compliant (at threshold, not over)", () => {
    const trips = buildTrips(5, 10)  // 5 × 10h = 50h
    expect(checkWeeklyHours(trips, "w/c 6 Apr")).toBeNull()
  })

  // C. 50h 1m → warning
  it("C: 50h 1m → warning", () => {
    const trips = [
      ...buildTrips(5, 10),
      tripOfHours("T6", "2026-04-12T06:00:00", 1 / 60),  // +1 minute
    ]
    const result = checkWeeklyHours(trips, "w/c 6 Apr")
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
    expect(result!.ruleId).toBe("WEEKLY_HOURS")
  })

  // D. Exactly 56h → warning (56h is the limit, hitting it exactly is a warning not violation)
  it("D: exactly 56h → warning (at the 56h limit)", () => {
    const trips = [
      ...buildTrips(5, 10),    // 50h
      tripOfHours("T6", "2026-04-12T06:00:00", 6),  // +6h = 56h
    ]
    const result = checkWeeklyHours(trips, "w/c 6 Apr")
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
    expect(Math.round(result!.totalMinutes)).toBe(3360)  // 56*60
  })

  // E. 56h 1m → violation
  it("E: 56h 1m → violation", () => {
    const trips = [
      ...buildTrips(5, 10),
      tripOfHours("T6", "2026-04-12T06:00:00", 6),      // 56h
      tripOfHours("T7", "2026-04-12T20:00:00", 1 / 60), // +1min
    ]
    const result = checkWeeklyHours(trips, "w/c 6 Apr")
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("violation")
    expect(result!.ruleId).toBe("WEEKLY_HOURS")
  })

  // F. 70h → violation
  it("F: 70h total → violation", () => {
    const trips = buildTrips(7, 10)  // 7 × 10h = 70h
    const result = checkWeeklyHours(trips, "w/c 6 Apr")
    expect(result!.severity).toBe("violation")
    expect(Math.round(result!.totalMinutes)).toBe(4200)  // 70*60
  })

  // G. Multiple trips summing to 52h → warning
  it("G: 10 trips × 5.2h = 52h → warning", () => {
    const trips = buildTrips(10, 5.2)
    const result = checkWeeklyHours(trips, "w/c 6 Apr")
    expect(result!.severity).toBe("warning")
    expect(Math.round(result!.totalMinutes)).toBe(3120)  // 52*60
  })

  // H. Empty → null
  it("H: empty trips → null", () => {
    expect(checkWeeklyHours([], "w/c 6 Apr")).toBeNull()
  })

})

describe("checkBiweeklyHours", () => {

  // I. 44h + 44h = 88h → warning
  it("I: 44h + 44h = 88h → warning", () => {
    const w1 = buildTrips(4, 11, "2026-03-30T06:00:00")  // 44h
    const w2 = buildTrips(4, 11, "2026-04-06T06:00:00")  // 44h
    const result = checkBiweeklyHours(w1, w2, "weeks 30 Mar – 12 Apr")
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
    expect(result!.ruleId).toBe("BIWEEKLY_HOURS")
    expect(Math.round(result!.totalMinutes)).toBe(88 * 60)
  })

  // J. 50h + 41h = 91h → violation
  it("J: 50h + 41h = 91h → violation", () => {
    const w1 = buildTrips(5, 10, "2026-03-30T06:00:00")                                  // 50h
    const w2 = [...buildTrips(4, 10, "2026-04-06T06:00:00"),
               tripOfHours("TX", "2026-04-10T06:00:00", 1)]  // 41h
    const result = checkBiweeklyHours(w1, w2, "weeks 30 Mar – 12 Apr")
    expect(result!.severity).toBe("violation")
  })

  // K. 40.5h + 40.5h = 81h → warning
  it("K: 40.5h + 40.5h = 81h → warning (just over biweekly warn threshold)", () => {
    const w1 = buildTrips(5, 8.1, "2026-03-30T06:00:00")  // 40.5h
    const w2 = buildTrips(5, 8.1, "2026-04-06T06:00:00")  // 40.5h
    const result = checkBiweeklyHours(w1, w2, "weeks 30 Mar – 12 Apr")
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
  })

  // L. Both empty → null
  it("L: both weeks empty → null", () => {
    expect(checkBiweeklyHours([], [], "weeks")).toBeNull()
  })

  // M. 28h + 28h = 56h → compliant
  it("M: 28h + 28h = 56h → compliant", () => {
    const w1 = buildTrips(4, 7, "2026-03-30T06:00:00")
    const w2 = buildTrips(4, 7, "2026-04-06T06:00:00")
    expect(checkBiweeklyHours(w1, w2, "weeks")).toBeNull()
  })

})
