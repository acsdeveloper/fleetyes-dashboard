/**
 * Tests — Overlap Detection
 *
 * Covers every overlap shape and every edge case that could produce
 * false positives or false negatives.
 */

import { describe, it, expect } from "vitest"
import { findOverlaps } from "../overlap"
import type { Trip } from "../types"

// ─── Helper ──────────────────────────────────────────────────────────────────

function trip(orderId: string, start: string, end: string): Trip {
  return {
    orderId,
    driverUuid: "driver-001",
    startTime: new Date(start),
    endTime:   new Date(end),
  }
}

// ─── 1. No overlap cases (should return empty) ───────────────────────────────

describe("No overlaps", () => {

  it("empty list → no overlaps", () => {
    expect(findOverlaps([])).toHaveLength(0)
  })

  it("single trip → no overlaps", () => {
    expect(findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
    ])).toHaveLength(0)
  })

  it("two trips fully separate (A ends Monday, B starts Tuesday) → no overlap", () => {
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
      trip("T2", "2026-04-07T08:00:00", "2026-04-07T16:00:00"),
    ])
    expect(results).toHaveLength(0)
  })

  it("back-to-back (A ends at 16:00, B starts at 16:00) → NOT an overlap", () => {
    // Start of B at exactly the end of A is allowed
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
      trip("T2", "2026-04-06T16:00:00", "2026-04-06T23:00:00"),
    ])
    expect(results).toHaveLength(0)
  })

  it("three separate trips → no overlaps", () => {
    const results = findOverlaps([
      trip("T1", "2026-04-06T06:00:00", "2026-04-06T10:00:00"),
      trip("T2", "2026-04-06T10:00:00", "2026-04-06T14:00:00"),
      trip("T3", "2026-04-06T14:00:00", "2026-04-06T20:00:00"),
    ])
    expect(results).toHaveLength(0)
  })

})

// ─── 2. Overlap shape 1: Partial overlap ─────────────────────────────────────

describe("Shape 1 — Partial overlap", () => {

  it("B starts mid-A → 1 overlap detected", () => {
    // A: 08:00–16:00, B: 14:00–20:00 → overlap 14:00–16:00 = 2h
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
      trip("T2", "2026-04-06T14:00:00", "2026-04-06T20:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(120)
    expect(results[0].overlapType).toBe("partial")
  })

  it("A starts mid-B (mirror) → 1 overlap detected", () => {
    // A: 14:00–20:00, B: 08:00–16:00 → same overlap regardless of input order
    const results = findOverlaps([
      trip("T1", "2026-04-06T14:00:00", "2026-04-06T20:00:00"),
      trip("T2", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(120)
  })

  it("minimal partial overlap (1 minute) → detected", () => {
    // A: 08:00–14:01, B: 14:00–18:00 → overlap 1 minute
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T14:01:00"),
      trip("T2", "2026-04-06T14:00:00", "2026-04-06T18:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(1)
  })

  it("partial overlap spanning midnight (multi-day A) → detected", () => {
    // A spans Mon–Tue, B starts Mon evening → overlap
    const results = findOverlaps([
      trip("T1", "2026-04-06T22:00:00", "2026-04-07T08:00:00"),
      trip("T2", "2026-04-07T06:00:00", "2026-04-07T14:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(120) // 06:00–08:00 = 2h
  })

})

// ─── 3. Overlap shape 2 & 3: Containment ─────────────────────────────────────

describe("Shape 2/3 — Containment", () => {

  it("B fully inside A → detected as containment", () => {
    // A: 08:00–20:00, B: 10:00–14:00 — B is inside A
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T20:00:00"),
      trip("T2", "2026-04-06T10:00:00", "2026-04-06T14:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(240) // 10:00–14:00 = 4h
    expect(results[0].overlapType).toBe("containment")
  })

  it("A fully inside B → detected as containment", () => {
    // A: 10:00–14:00, B: 08:00–20:00 — A is inside B
    const results = findOverlaps([
      trip("T1", "2026-04-06T10:00:00", "2026-04-06T14:00:00"),
      trip("T2", "2026-04-06T08:00:00", "2026-04-06T20:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(240)
    expect(results[0].overlapType).toBe("containment")
  })

  it("B shares start with A but ends earlier → containment", () => {
    // A: 08:00–20:00, B: 08:00–12:00
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T20:00:00"),
      trip("T2", "2026-04-06T08:00:00", "2026-04-06T12:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapType).toBe("containment")
  })

  it("B shares end with A but starts later → containment", () => {
    // A: 08:00–20:00, B: 16:00–20:00
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T20:00:00"),
      trip("T2", "2026-04-06T16:00:00", "2026-04-06T20:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapType).toBe("containment")
  })

})

// ─── 4. Overlap shape 4: Exact same window ────────────────────────────────────

describe("Shape 4 — Exact same window", () => {

  it("two trips with identical start and end → exact overlap", () => {
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
      trip("T2", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(480)
    expect(results[0].overlapType).toBe("exact")
  })

})

// ─── 5. Multiple overlapping trips ───────────────────────────────────────────

describe("Multiple overlaps", () => {

  it("3 trips all overlapping each other → 3 pairs detected", () => {
    // T1 08–18, T2 10–20, T3 12–22 — each pair overlaps
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T18:00:00"),
      trip("T2", "2026-04-06T10:00:00", "2026-04-06T20:00:00"),
      trip("T3", "2026-04-06T12:00:00", "2026-04-06T22:00:00"),
    ])
    expect(results).toHaveLength(3)
  })

  it("3 trips: first two overlap, third is separate → 1 pair", () => {
    const results = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T14:00:00"),
      trip("T2", "2026-04-06T12:00:00", "2026-04-06T18:00:00"),
      trip("T3", "2026-04-06T20:00:00", "2026-04-06T23:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].tripA.orderId).toBe("T1")
    expect(results[0].tripB.orderId).toBe("T2")
  })

  it("5 trips, only one overlapping pair → 1 result", () => {
    const results = findOverlaps([
      trip("T1", "2026-04-06T06:00:00", "2026-04-06T10:00:00"),
      trip("T2", "2026-04-06T10:00:00", "2026-04-06T14:00:00"),
      trip("T3", "2026-04-06T13:00:00", "2026-04-06T17:00:00"), // overlaps T2
      trip("T4", "2026-04-06T17:00:00", "2026-04-06T20:00:00"),
      trip("T5", "2026-04-06T22:00:00", "2026-04-07T06:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].tripA.orderId).toBe("T2")
    expect(results[0].tripB.orderId).toBe("T3")
  })

  it("multi-day trip overlapping with two other trips → 2 pairs", () => {
    // T1 spans Mon–Wed; T2 is on Tuesday; T3 is on Wednesday morning
    const results = findOverlaps([
      trip("T1", "2026-04-06T22:00:00", "2026-04-08T10:00:00"),  // Mon 22:00 – Wed 10:00
      trip("T2", "2026-04-07T08:00:00", "2026-04-07T16:00:00"),  // Tue 08:00–16:00 — inside T1
      trip("T3", "2026-04-08T08:00:00", "2026-04-08T14:00:00"),  // Wed 08:00–14:00 — overlaps T1 tail
    ])
    expect(results).toHaveLength(2)
  })

})

// ─── 6. Input order independence ─────────────────────────────────────────────

describe("Input order does not affect results", () => {

  it("same overlapping pair in reverse order → same result", () => {
    const forward = findOverlaps([
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
      trip("T2", "2026-04-06T14:00:00", "2026-04-06T20:00:00"),
    ])
    const reverse = findOverlaps([
      trip("T2", "2026-04-06T14:00:00", "2026-04-06T20:00:00"),
      trip("T1", "2026-04-06T08:00:00", "2026-04-06T16:00:00"),
    ])
    expect(forward).toHaveLength(1)
    expect(reverse).toHaveLength(1)
    expect(forward[0].overlapMinutes).toBe(reverse[0].overlapMinutes)
  })

})

// --- 7. Your EXACT real-world scenario ---

describe("Real scenario � overnight trip overlapping next-day trip", () => {

  it("Trip 1: Mon 23:30 to Tue 10:00, Trip 2: Tue 06:30 to Tue 14:00 = OVERLAP", () => {
    const results = findOverlaps([
      trip("T1", "2026-04-06T23:30:00", "2026-04-07T10:00:00"),
      trip("T2", "2026-04-07T06:30:00", "2026-04-07T14:00:00"),
    ])
    expect(results).toHaveLength(1)
    expect(results[0].overlapMinutes).toBe(210)
  })

})
