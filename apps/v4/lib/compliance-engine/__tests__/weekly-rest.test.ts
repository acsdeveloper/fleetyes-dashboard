/**
 * Tests — Weekly Rest (EC 561/2006 Art.8.6)
 *
 * Regular rest: ≥ 45h → compliant
 * Reduced rest: 24h–44h59m → warning
 * No weekly rest: < 24h → violation
 *
 * Scenarios:
 *   A. One big gap of 48h → compliant (regular rest)
 *   B. Exactly 45h gap → compliant (at threshold)
 *   C. 44h 59m gap → warning (just below regular)
 *   D. Exactly 24h gap → warning (at reduced threshold)
 *   E. 23h 59m gap → violation (no valid weekly rest)
 *   F. Many small gaps, largest is 36h → warning
 *   G. Many small gaps, largest is 20h → violation
 *   H. Single trip → null (no inter-trip gap to evaluate)
 *   I. Empty trips → null
 *   J. Largest gap from middle pair, others short → correctly identifies best gap
 *   K. All trips same day (0 gaps between them after group) → violation
 *   L. Trips unsorted — should sort and find correct gap
 *   M. Exactly 24h 1min gap → warning
 */

import { describe, it, expect } from "vitest"
import { findWeeklyRestViolation } from "../weekly-rest"

function trip(id: string, start: string, end: string) {
  return { orderId: id, startTime: new Date(start), endTime: new Date(end) }
}

// Reference week: Mon 6 Apr – Sun 12 Apr 2026
const MON = "2026-04-06"
const WED = "2026-04-08"
const FRI = "2026-04-10"
const SAT = "2026-04-11"

describe("findWeeklyRestViolation", () => {

  // A. 48h gap → compliant
  it("A: largest gap 48h → compliant (null)", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", `${WED}T14:00:00`, `${WED}T22:00:00`),  // 48h after T1 ends
    ]
    expect(findWeeklyRestViolation(trips)).toBeNull()
  })

  // B. Exactly 46h → compliant (company policy threshold)
  it("B: exactly 46h gap → compliant (company policy threshold)", () => {
    const start2 = new Date(new Date(`${MON}T14:00:00`).getTime() + 46 * 3600 * 1000)
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", start2.toISOString(), new Date(start2.getTime() + 4 * 3600000).toISOString()),
    ]
    expect(findWeeklyRestViolation(trips)).toBeNull()
  })

  // B2. Exactly 45h → warning (below 46h policy, but ≥ 24h reduced)
  it("B2: exactly 45h gap → warning (meets EC minimum but below 46h company policy)", () => {
    const start2 = new Date(new Date(`${MON}T14:00:00`).getTime() + 45 * 3600 * 1000)
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", start2.toISOString(), new Date(start2.getTime() + 4 * 3600000).toISOString()),
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
  })

  // C. 45h 59m → warning (just below 46h policy)
  it("C: 45h 59m gap → warning (just below 46h company policy threshold)", () => {
    const gapMs  = (46 * 60 - 1) * 60 * 1000  // 45h59m in ms
    const start2 = new Date(new Date(`${MON}T14:00:00`).getTime() + gapMs)
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", start2.toISOString(), new Date(start2.getTime() + 4 * 3600000).toISOString()),
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
  })

  // D. Exactly 24h → warning
  it("D: exactly 24h gap → warning (at reduced rest threshold)", () => {
    const start2 = new Date(new Date(`${MON}T14:00:00`).getTime() + 24 * 3600 * 1000)
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", start2.toISOString(), new Date(start2.getTime() + 4 * 3600000).toISOString()),
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
  })

  // E. 23h 59m → violation
  it("E: 23h 59m gap → violation (below 24h minimum)", () => {
    const gapMs  = (24 * 60 - 1) * 60 * 1000
    const start2 = new Date(new Date(`${MON}T14:00:00`).getTime() + gapMs)
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", start2.toISOString(), new Date(start2.getTime() + 4 * 3600000).toISOString()),
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("violation")
  })

  // F. Multiple gaps, largest is 36h → warning
  it("F: many gaps, largest is 36h → warning", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends Mon 14:00
      trip("T2", `${MON}T23:00:00`, `${FRI}T22:00:00`),  // 9h gap — starts Mon 23:00
      // T2 ends Fri 22:00, T3 starts Sun 10:00 → 36h gap
      trip("T3", "2026-04-12T10:00:00", "2026-04-12T18:00:00"),
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result).not.toBeNull()
    expect(result!.severity).toBe("warning")
    expect(Math.round(result!.longestGapMinutes)).toBe(36 * 60)
    expect(result!.tripBeforeRestUuid).toBe("T2")
    expect(result!.tripAfterRestUuid).toBe("T3")
  })

  // G. Largest gap only 20h → violation
  it("G: largest gap 20h → violation", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", `${MON}T23:00:00`, `${WED}T20:00:00`),   // 9h gap
      trip("T3", `${WED}T23:00:00`, `${FRI}T18:00:00`),   // 3h gap → 45h trip! then
      trip("T4", `${SAT}T14:00:00`, `${SAT}T22:00:00`),   // 20h gap before T4
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result!.severity).toBe("violation")
    expect(Math.round(result!.longestGapMinutes)).toBe(20 * 60)
  })

  // H. Single trip → null
  it("H: single trip → null (no inter-trip gap)", () => {
    const trips = [trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`)]
    expect(findWeeklyRestViolation(trips)).toBeNull()
  })

  // I. Empty → null
  it("I: empty trips → null", () => {
    expect(findWeeklyRestViolation([])).toBeNull()
  })

  // J. Gap correctly identified from middle pair
  it("J: best gap is between middle pair, not first or last", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T10:00:00`),
      trip("T2", `${MON}T20:00:00`, `${MON}T22:00:00`),   // 10h gap after T1
      // 48h gap here:
      trip("T3", `${WED}T22:00:00`, `${WED}T23:59:00`),
      trip("T4", `${FRI}T06:00:00`, `${FRI}T10:00:00`),   // 30h after T3
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result).toBeNull()  // 48h gap satisfies regular rest
  })

  // K. Trips all same day with tiny gaps → violation
  it("K: all trips on same day with 1h gaps → violation", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T09:00:00`),
      trip("T2", `${MON}T10:00:00`, `${MON}T13:00:00`),  // 1h gap
      trip("T3", `${MON}T14:00:00`, `${MON}T17:00:00`),  // 1h gap
      trip("T4", `${MON}T18:00:00`, `${MON}T21:00:00`),  // 1h gap
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result!.severity).toBe("violation")
  })

  // L. Trips unsorted input — should still find correct maximum gap
  it("L: unsorted trips → still finds correct longest gap", () => {
    // Give trips in reverse order — T3 first, T1 last
    const trips = [
      trip("T3", `${FRI}T06:00:00`, `${FRI}T14:00:00`),
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", `${MON}T23:00:00`, `${MON}T23:30:00`),
    ]
    // T1 ends Mon 14:00, T2 starts Mon 23:00 → 9h
    // T2 ends Mon 23:30, T3 starts Fri 06:00 → ~78.5h → compliant
    expect(findWeeklyRestViolation(trips)).toBeNull()
  })

  // M. Exactly 24h 1min → warning
  it("M: 24h 1min gap → warning (just over reduced threshold)", () => {
    const gapMs  = (24 * 60 + 1) * 60 * 1000
    const start2 = new Date(new Date(`${MON}T14:00:00`).getTime() + gapMs)
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", start2.toISOString(), new Date(start2.getTime() + 4 * 3600000).toISOString()),
    ]
    const result = findWeeklyRestViolation(trips)
    expect(result!.severity).toBe("warning")
  })

})
