/**
 * Tests for rest-gap rule (EC 561/2006)
 *
 * Scenarios:
 *  A. Gap >= 11h  → no result (compliant)
 *  B. Gap 9h–11h  → warning (reduced rest)
 *  C. Gap < 9h    → violation
 *  D. Exact 11h   → compliant
 *  E. Exact 9h    → compliant (boundary — 9h IS the minimum)
 *  F. Exactly 1 minute below 9h → violation
 *  G. Overnight trip ending at 05:00, next trip at 13:00 → 8h gap → violation
 *  H. Overnight trip ending at 05:00, next trip at 14:00 → 9h gap → compliant
 *  I. Overnight trip ending at 05:00, next trip at 16:00 → 11h gap → compliant
 *  J. Three trips: A→B compliant, B→C violation
 *  K. Negative gap (trips overlap) → skipped (overlap rule handles it)
 *  L. Single trip → no result
 *  M. Unsorted input → sorted internally, still correct
 *  N. Gap exactly 10h → warning
 */

import { describe, it, expect } from "vitest"
import { findRestGapViolations } from "../rest-gap"

// Helper: build a trip with given start/end as ISO strings
function trip(id: string, start: string, end: string) {
  return { orderId: id, startTime: new Date(start), endTime: new Date(end) }
}

// Reference date: Monday 2026-04-06
const MON = "2026-04-06"
const TUE = "2026-04-07"
const WED = "2026-04-08"

describe("findRestGapViolations", () => {

  // ── A. Compliant: 12h gap ────────────────────────────────────────────────
  it("A: 12h gap between trips → compliant (no result)", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends 14:00
      trip("T2", `${TUE}T02:00:00`, `${TUE}T10:00:00`),  // starts 02:00 → 12h gap
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── B. Warning: 10h gap → reduced rest ──────────────────────────────────
  it("B: 10h gap → reduced rest warning", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends 14:00
      trip("T2", `${TUE}T00:00:00`, `${TUE}T08:00:00`),  // starts 00:00 → 10h gap
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
    expect(results[0].tripAUuid).toBe("T1")
    expect(results[0].tripBUuid).toBe("T2")
    expect(Math.round(results[0].gapMinutes)).toBe(600)  // 10h = 600m
  })

  // ── C. Violation: 7h gap ─────────────────────────────────────────────────
  it("C: 7h gap → violation", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T18:00:00`),  // ends 18:00
      trip("T2", `${TUE}T01:00:00`, `${TUE}T09:00:00`),  // starts 01:00 → 7h gap
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("violation")
    expect(Math.round(results[0].gapMinutes)).toBe(420)  // 7h = 420m
  })

  // ── D. Exact 11h boundary → compliant ────────────────────────────────────
  it("D: exactly 11h gap → compliant", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends 14:00
      trip("T2", `${TUE}T01:00:00`, `${TUE}T09:00:00`),  // starts 01:00 → exactly 11h
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── E. Exact 9h boundary → compliant (9h IS legal minimum) ──────────────
  it("E: exactly 9h gap → compliant (legal minimum)", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends 14:00
      trip("T2", `${MON}T23:00:00`, `${TUE}T07:00:00`),  // starts 23:00 → exactly 9h
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── F. 1 minute below 9h → violation ─────────────────────────────────────
  it("F: 8h 59m gap → violation", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends 14:00
      trip("T2", `${MON}T22:59:00`, `${TUE}T06:59:00`),  // starts 22:59 → 8h59m gap
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("violation")
  })

  // ── G. Overnight trip, next trip 8h after it ends → violation ────────────
  it("G: overnight trip ends 05:00, next starts 13:00 → 8h gap → violation", () => {
    const trips = [
      trip("T1", `${MON}T23:30:00`, `${TUE}T05:00:00`),  // overnight
      trip("T2", `${TUE}T13:00:00`, `${TUE}T20:00:00`),  // 8h after T1 ends
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("violation")
    expect(Math.round(results[0].gapMinutes)).toBe(480)  // 8h = 480m
  })

  // ── H. Overnight trip, next trip 9h after → compliant ────────────────────
  it("H: overnight trip ends 05:00, next starts 14:00 → 9h gap → compliant", () => {
    const trips = [
      trip("T1", `${MON}T23:30:00`, `${TUE}T05:00:00`),
      trip("T2", `${TUE}T14:00:00`, `${TUE}T20:00:00`),  // 9h after T1 ends
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── I. Overnight trip, next trip 11h after → compliant ───────────────────
  it("I: overnight trip ends 05:00, next starts 16:00 → 11h gap → compliant", () => {
    const trips = [
      trip("T1", `${MON}T23:30:00`, `${TUE}T05:00:00`),
      trip("T2", `${TUE}T16:00:00`, `${WED}T00:00:00`),  // 11h after T1 ends
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── J. Three trips: A→B ok, B→C violation ────────────────────────────────
  it("J: three trips — first gap ok, second gap violation", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),  // ends Mon 14:00
      trip("T2", `${TUE}T01:00:00`, `${TUE}T10:00:00`),  // starts Tue 01:00 → 11h gap ✓
      trip("T3", `${TUE}T16:00:00`, `${TUE}T23:00:00`),  // starts Tue 16:00 → only 6h gap ✗
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].tripAUuid).toBe("T2")
    expect(results[0].tripBUuid).toBe("T3")
    expect(results[0].severity).toBe("violation")
    expect(Math.round(results[0].gapMinutes)).toBe(360)  // 6h
  })

  // ── K. Overlapping trips → skipped (negative gap) ─────────────────────────
  it("K: overlapping trips → skipped (overlap rule handles it)", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T18:00:00`),
      trip("T2", `${MON}T10:00:00`, `${MON}T20:00:00`),  // starts before T1 ends
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── L. Single trip → no result ────────────────────────────────────────────
  it("L: single trip → no result", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
    ]
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── M. Unsorted input → sorted internally ────────────────────────────────
  it("M: unsorted input is sorted internally before checking", () => {
    const trips = [
      trip("T2", `${TUE}T01:00:00`, `${TUE}T09:00:00`),   // later trip listed first
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),   // earlier trip listed second
    ]
    // Gap = T2 start (01:00 Tue) - T1 end (14:00 Mon) = 11h → compliant
    expect(findRestGapViolations(trips)).toHaveLength(0)
  })

  // ── N. Exactly 10h → warning ─────────────────────────────────────────────
  it("N: exactly 10h gap → warning (reduced rest)", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${MON}T14:00:00`),
      trip("T2", `${TUE}T00:00:00`, `${TUE}T08:00:00`),  // 10h gap
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
    expect(Math.round(results[0].gapMinutes)).toBe(600)
  })

  // ── O. Multi-day trip gap ─────────────────────────────────────────────────
  it("O: multi-day trip (Mon→Wed), next trip Wed night — only 7h rest → violation", () => {
    const trips = [
      trip("T1", `${MON}T06:00:00`, `${WED}T09:00:00`),   // multi-day, ends Wed 09:00
      trip("T2", `${WED}T16:00:00`, `${WED}T23:59:00`),   // starts Wed 16:00 → 7h gap
    ]
    const results = findRestGapViolations(trips)
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("violation")
  })

})
