/**
 * Tests for daily hours rule (EC 561/2006 Art.6)
 *
 * Scenarios:
 *  A. 8h total on one day → compliant
 *  B. Exactly 9h → compliant (9h is the limit, not over)
 *  C. 9h 1m → warning
 *  D. Exactly 10h → warning (10h is permissible)
 *  E. 10h 1m → violation
 *  F. Two trips on same day: 5h + 6h = 11h → violation
 *  G. Overnight trip clipped correctly: 23:00–07:00 → 1h on day 1, 7h on day 2 → both compliant
 *  H. Multi-day trip (Mon–Wed): hours clipped and summed per day
 *  I. Single trip spanning exactly midnight: split 1h/7h
 *  J. Two trips: one same-day total 9h30m → warning; two separate drivers irrelevant
 *  K. Single trip 0h (zero duration) → compliant
 *  L. Multi-day with heavy Mon (10h+) → violation on Mon, compliant other days
 *  M. Exactly 10h across two trips → warning (at limit)
 *  N. Empty trips → no result
 */

import { describe, it, expect } from "vitest"
import { findDailyHoursViolations } from "../daily-hours"

function trip(id: string, start: string, end: string) {
  return { orderId: id, startTime: new Date(start), endTime: new Date(end) }
}

const D1 = "2026-04-06"  // Monday
const D2 = "2026-04-07"  // Tuesday
const D3 = "2026-04-08"  // Wednesday

describe("findDailyHoursViolations", () => {

  // A. 8h → compliant
  it("A: 8h total → compliant", () => {
    const trips = [trip("T1", `${D1}T06:00:00`, `${D1}T14:00:00`)]
    expect(findDailyHoursViolations(trips)).toHaveLength(0)
  })

  // B. Exactly 9h → compliant
  it("B: exactly 9h → compliant (9h is the standard limit, not over)", () => {
    const trips = [trip("T1", `${D1}T06:00:00`, `${D1}T15:00:00`)]
    expect(findDailyHoursViolations(trips)).toHaveLength(0)
  })

  // C. 9h 1m → warning
  it("C: 9h 1m → warning", () => {
    const trips = [trip("T1", `${D1}T06:00:00`, `${D1}T15:01:00`)]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
    expect(results[0].date).toBe(D1)
    expect(Math.round(results[0].totalMinutes)).toBe(541)
  })

  // D. Exactly 10h → warning (10h is permissible but above 9h standard)
  it("D: exactly 10h → warning (10h is the absolute max, at limit)", () => {
    const trips = [trip("T1", `${D1}T06:00:00`, `${D1}T16:00:00`)]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
    expect(Math.round(results[0].totalMinutes)).toBe(600)
  })

  // E. 10h 1m → violation
  it("E: 10h 1m → violation", () => {
    const trips = [trip("T1", `${D1}T06:00:00`, `${D1}T16:01:00`)]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("violation")
    expect(Math.round(results[0].totalMinutes)).toBe(601)
  })

  // F. Two trips same day: 5h + 6h = 11h → violation
  it("F: two trips same day totalling 11h → violation", () => {
    const trips = [
      trip("T1", `${D1}T06:00:00`, `${D1}T11:00:00`),  // 5h
      trip("T2", `${D1}T13:00:00`, `${D1}T20:00:00`),  // 7h
    ]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("violation")
    expect(Math.round(results[0].totalMinutes)).toBe(720)
    expect(results[0].contributingTripUuids).toContain("T1")
    expect(results[0].contributingTripUuids).toContain("T2")
  })

  // G. Overnight trip, clipped to each day
  it("G: overnight trip 23:00–07:00 → 1h on day 1, 7h on day 2 → both compliant", () => {
    const trips = [trip("T1", `${D1}T23:00:00`, `${D2}T07:00:00`)]
    const results = findDailyHoursViolations(trips)
    // 1h on D1, 7h on D2 — both under 9h
    expect(results).toHaveLength(0)
  })

  // H. Multi-day trip: Mon 08:00 – Wed 02:00
  it("H: multi-day trip Mon 08:00–Wed 02:00 → 16h Mon, 24h Tue, 2h Wed → Mon and Tue violations", () => {
    const trips = [trip("T1", `${D1}T08:00:00`, `${D3}T02:00:00`)]
    const results = findDailyHoursViolations(trips)
    // D1: 08:00–23:59:59 = 16h → violation
    // D2: 00:00–23:59:59 = 24h → violation
    // D3: 00:00–02:00 = 2h → compliant
    expect(results.some(r => r.date === D1 && r.severity === "violation")).toBe(true)
    expect(results.some(r => r.date === D2 && r.severity === "violation")).toBe(true)
    expect(results.some(r => r.date === D3)).toBe(false)
  })

  // I. Trip spans exactly midnight: 23:00 D1 – 06:00 D2 → 1h on D1, 6h on D2
  it("I: trip 23:00 D1 – 06:00 D2 → 1h D1 + 6h D2 → both compliant", () => {
    const trips = [trip("T1", `${D1}T23:00:00`, `${D2}T06:00:00`)]
    expect(findDailyHoursViolations(trips)).toHaveLength(0)
  })

  // J. Two trips same day: 4h30m + 5h = 9h30m → warning
  it("J: two trips same day totalling 9h30m → warning", () => {
    const trips = [
      trip("T1", `${D1}T06:00:00`, `${D1}T10:30:00`),  // 4h30m
      trip("T2", `${D1}T12:00:00`, `${D1}T17:00:00`),  // 5h
    ]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
    expect(Math.round(results[0].totalMinutes)).toBe(570)
  })

  // K. Zero-duration trip → compliant
  it("K: zero-duration trip → compliant", () => {
    const trips = [trip("T1", `${D1}T10:00:00`, `${D1}T10:00:00`)]
    expect(findDailyHoursViolations(trips)).toHaveLength(0)
  })

  // L. Multi-day: heavy Monday (10h+), light others
  it("L: multi-day trip — violation on Mon, compliant on Tue", () => {
    const trips = [
      trip("T1", `${D1}T06:00:00`, `${D1}T16:30:00`),  // 10.5h → violation on D1
      trip("T2", `${D2}T10:00:00`, `${D2}T14:00:00`),  // 4h → compliant on D2
    ]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].date).toBe(D1)
    expect(results[0].severity).toBe("violation")
  })

  // M. Two trips on same day totalling exactly 10h → warning (at limit)
  it("M: two trips totalling exactly 10h → warning", () => {
    const trips = [
      trip("T1", `${D1}T06:00:00`, `${D1}T11:00:00`),  // 5h
      trip("T2", `${D1}T13:00:00`, `${D1}T18:00:00`),  // 5h
    ]
    const results = findDailyHoursViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
    expect(Math.round(results[0].totalMinutes)).toBe(600)
  })

  // N. Empty input → no results
  it("N: empty input → no results", () => {
    expect(findDailyHoursViolations([])).toHaveLength(0)
  })

})
