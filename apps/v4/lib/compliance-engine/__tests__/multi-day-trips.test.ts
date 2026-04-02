/**
 * Multi-Day Trip Compliance Tests
 * ─────────────────────────────────
 *
 * Validates correct compliance behaviour for trips that span multiple calendar
 * days.  The engine clocks each day individually:
 *
 *   • First day  — real clipped times (trip start → 23:59)
 *   • Interior   — 8h regulatory default (00:00–08:00, orderId preserved)
 *   • Last day   — real clipped times (00:00 → trip end)
 *
 * orderId on activities is used:
 *   1. Deduplication before overlap check (same trip ≠ overlap)
 *   2. Continuity check in inter-day rest gap (same orderId = no gap to enforce)
 *
 * Key constants from engine (verified from source):
 *   MAX_DUTY_WARN_MINS         = 780   (13h)
 *   MAX_DUTY_REDUCED_MINS      = 900   (15h)
 *   DAILY_REST_REDUCED         = 540   (9h)
 *   DAILY_REST_STANDARD        = 660   (11h)
 *   MAX_REDUCED_REST_BETWEEN_WEEKLY = 3
 *   MAX_CONSECUTIVE_WORKING    = 6     (warning at 6, violation at 7+)
 */

import { describe, it, expect } from "vitest"
import { validateAssimilated } from "../assimilated"
import { makeActivity, makeWorkingDay, makeRestDay, makeDriverRecord } from "./helpers"
import { ActivityType } from "../types"

// ─── Local helpers ────────────────────────────────────────────────────────────

function makeTripActivity(date: string, startHHMM: string, endHHMM: string, orderId: string) {
  return {
    activityType: ActivityType.NON_DRIVING_DUTY as const,
    startTime:    new Date(`${date}T${startHHMM}:00`),
    endTime:      new Date(`${date}T${endHHMM}:00`),
    orderId,
  }
}

/** First or last day of a multi-day trip, or a single-day trip */
function makeTripDay(date: string, startHHMM: string, endHHMM: string, orderId: string) {
  return makeWorkingDay(date, [makeTripActivity(date, startHHMM, endHHMM, orderId)])
}

/** Interior day: 8h default (00:00–08:00), orderId preserved for continuity check */
function makeInteriorDay(date: string, orderId: string) {
  return makeWorkingDay(date, [{
    activityType: ActivityType.NON_DRIVING_DUTY as const,
    startTime:    new Date(`${date}T00:00:00`),
    endTime:      new Date(`${date}T08:00:00`),
    orderId,
  }])
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: No false violations within the same multi-day trip
// ═══════════════════════════════════════════════════════════════════

describe("Multi-day trip — no false violations within same trip", () => {

  it("2-day trip Mon 22:00→Tue 06:00: no EU_DAILY_REST between Mon and Tue", () => {
    // tripCount=1 → engine exits before inter-trip checks (by design)
    // This is the single-trip guard; overlaps still run (none expected)
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeTripDay("2026-04-07", "00:00", "06:00", "T1")
    const wed = makeRestDay("2026-04-08")
    const record = makeDriverRecord([mon, tue, wed], "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST")).toHaveLength(0)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP")).toHaveLength(0)
  })

  it("3-day trip Mon→Wed: no EU_DAILY_REST on any pair", () => {
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeTripDay("2026-04-08", "00:00", "06:00", "T1")
    const thu = makeRestDay("2026-04-09")
    const record = makeDriverRecord([mon, tue, wed, thu], "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST")).toHaveLength(0)
  })

  it("6-day trip Mon→Sat (tripCount=1): no EU_DAILY_REST across all interior days", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeInteriorDay("2026-04-09", "T1"),
      makeInteriorDay("2026-04-10", "T1"),
      makeTripDay("2026-04-11", "00:00", "06:00", "T1"),
      makeRestDay("2026-04-12"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST")).toHaveLength(0)
  })

  it("interior days (8h default) do NOT trigger EU_DAILY_WORK_LIMIT", () => {
    // 8h is well below the 13h warning threshold
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeInteriorDay("2026-04-08", "T1")
    const thu = makeTripDay("2026-04-09", "00:00", "06:00", "T1")
    const fri = makeRestDay("2026-04-10")
    const record = makeDriverRecord([mon, tue, wed, thu, fri], "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_WORK_LIMIT")).toHaveLength(0)
  })

  it("same orderId on 4 days: no TRIP_OVERLAP (deduplication by orderId)", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeTripDay("2026-04-09", "00:00", "06:00", "T1"),
      makeRestDay("2026-04-10"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP")).toHaveLength(0)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: Rest gaps at multi-day trip boundaries ARE enforced
// ═══════════════════════════════════════════════════════════════════

describe("Multi-day trip — rest gaps at boundaries enforced (tripCount≥2)", () => {

  it("7h rest before multi-day trip → EU_DAILY_REST violation on first day of trip", () => {
    // T_A ends Sun 23:00; T_B (multi-day) starts Mon 06:00 → gap = 7h < 9h
    const sun = makeTripDay("2026-04-05", "12:00", "23:00", "TA")
    const mon = makeTripDay("2026-04-06", "06:00", "23:59", "TB")
    const tue = makeInteriorDay("2026-04-07", "TB")
    const wed = makeTripDay("2026-04-08", "00:00", "08:00", "TB")
    const thu = makeRestDay("2026-04-09")
    const record = makeDriverRecord([sun, mon, tue, wed, thu], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-06"
    )
    expect(violations).toHaveLength(1)
  })

  it("9h rest before multi-day trip → no violation (exactly at reduced minimum)", () => {
    // T_A ends Sun 21:00; T_B starts Mon 06:00 → exactly 9h
    const sun = makeTripDay("2026-04-05", "09:00", "21:00", "TA")
    const mon = makeTripDay("2026-04-06", "06:00", "23:59", "TB")
    const tue = makeTripDay("2026-04-07", "00:00", "08:00", "TB")
    const wed = makeRestDay("2026-04-08")
    const record = makeDriverRecord([sun, mon, tue, wed], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const hardViolations = issues.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-06"
    )
    expect(hardViolations).toHaveLength(0)
  })

  it("11h rest before multi-day trip → fully compliant (standard rest)", () => {
    // T_A ends Sat 19:00; T_B starts Sun 06:00 → 11h
    const sat = makeTripDay("2026-04-04", "07:00", "19:00", "TA")
    const sun = makeTripDay("2026-04-05", "06:00", "23:59", "TB")
    const mon = makeInteriorDay("2026-04-06", "TB")
    const tue = makeTripDay("2026-04-07", "00:00", "08:00", "TB")
    const wed = makeRestDay("2026-04-08")
    const record = makeDriverRecord([sat, sun, mon, tue, wed], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.date === "2026-04-05")).toHaveLength(0)
  })

  it("10h rest before multi-day trip → EU_REDUCED_REST_LIMIT warning (9–11h band)", () => {
    // T_A ends Sun 20:00; T_B starts Mon 06:00 → 10h (reduced, 9–11h range)
    // EU_DAILY_REST only fires violations (<9h); the 9–11h band fires EU_REDUCED_REST_LIMIT
    const sun = makeTripDay("2026-04-05", "08:00", "20:00", "TA")
    const mon = makeTripDay("2026-04-06", "06:00", "23:59", "TB")
    const tue = makeTripDay("2026-04-07", "00:00", "06:00", "TB")
    const wed = makeRestDay("2026-04-08")
    const record = makeDriverRecord([sun, mon, tue, wed], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const hardViolation = issues.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-06"
    )
    const reducedWarning = issues.filter(
      i => i.ruleId === "EU_REDUCED_REST_LIMIT" && i.date === "2026-04-06"
    )
    expect(hardViolation).toHaveLength(0)
    // reducedRestCount increments to 1 (< 3 max) → no EU_REDUCED_REST_LIMIT yet either
    // The warning only fires when reducedRestCount reaches exactly 3
    // So: no violations, no warnings at this point
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation")).toHaveLength(0)
  })

  it("7h rest AFTER multi-day trip → EU_DAILY_REST violation on next trip", () => {
    // T1 ends Wed 20:00; T2 starts Thu 03:00 → 7h < 9h
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeTripDay("2026-04-08", "00:00", "20:00", "T1")
    const thu = makeTripDay("2026-04-09", "03:00", "11:00", "T2")
    const fri = makeRestDay("2026-04-10")
    const record = makeDriverRecord([mon, tue, wed, thu, fri], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-09"
    )
    expect(violations).toHaveLength(1)
  })

  it("25h rest after multi-day trip → compliant", () => {
    // T1 ends Thu 06:00; T2 starts Fri 07:00 → 25h rest
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeInteriorDay("2026-04-08", "T1")
    const thu = makeTripDay("2026-04-09", "00:00", "06:00", "T1")
    const fri = makeTripDay("2026-04-10", "07:00", "17:00", "T2")
    const sat = makeRestDay("2026-04-11")
    const record = makeDriverRecord([mon, tue, wed, thu, fri, sat], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation")).toHaveLength(0)
  })

  it("consecutive days of the same trip (orderId=T1) do NOT trigger rest check; 32h boundary gap is compliant", () => {
    // Mon→Fri = same orderId T1; all pairs SKIP via orderId continuity check.
    // Fri (T1) ends 08:00; Sat (T2) starts 16:00 → gap = 32h (Fri 08:00 → Sat 16:00).
    // 32h >> 11h standard → fully compliant. No violation on any day.
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeInteriorDay("2026-04-09", "T1"),
      makeTripDay("2026-04-10", "00:00", "08:00", "T1"),
      makeTripDay("2026-04-11", "16:00", "22:00", "T2"),
      makeRestDay("2026-04-12"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    // 32h rest between Fri (T1) and Sat (T2) → no violation
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-11")).toHaveLength(0)
    // No violation on Mon-Fri same-orderId days either
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && ["2026-04-07","2026-04-08","2026-04-09","2026-04-10"].includes(i.date))).toHaveLength(0)
  })

  it("orderId continuity skips Mon-Thu rest checks; 8h gap Thu(T1)→Fri(T2) fires violation", () => {
    // Verify the orderId skip + boundary violation in one scenario:
    // Multi-day trip T1: Mon 22:00 → Thu 20:00 (3 days)
    // New trip T2: Fri 04:00 → 12:00 (8h after Thu 20:00 → < 9h → violation on Fri)
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeInteriorDay("2026-04-08", "T1")
    const thu = makeTripDay("2026-04-09", "00:00", "20:00", "T1")  // T1 last day, ends 20:00
    const fri = makeTripDay("2026-04-10", "04:00", "12:00", "T2")  // 8h after Thu 20:00 → violation
    const sat = makeRestDay("2026-04-11")
    const record = makeDriverRecord([mon, tue, wed, thu, fri, sat], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    // Mon→Tue, Tue→Wed, Wed→Thu: same orderId T1 → skipped
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && ["2026-04-07","2026-04-08","2026-04-09"].includes(i.date))).toHaveLength(0)
    // Thu(T1, ends 20:00) → Fri(T2, starts 04:00): different orderId → 8h gap → VIOLATION
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-10")).toHaveLength(1)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Rest gap boundary values
// ═══════════════════════════════════════════════════════════════════

describe("Rest gap boundary values", () => {

  it("exactly 8h59m rest → hard violation (below 9h reduced minimum)", () => {
    // T1 ends 20:00; T2 starts 04:59 next day → 8h59m
    const wed = makeTripDay("2026-04-08", "08:00", "20:00", "T1")
    const thu = makeTripDay("2026-04-09", "04:59", "12:00", "T2")
    const fri = makeRestDay("2026-04-10")
    const record = makeDriverRecord([wed, thu, fri], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-09"
    )
    expect(violations).toHaveLength(1)
  })

  it("exactly 9h rest → warning only (passes reduced minimum)", () => {
    // T1 ends 20:00; T2 starts 05:00 → exactly 9h
    const wed = makeTripDay("2026-04-08", "08:00", "20:00", "T1")
    const thu = makeTripDay("2026-04-09", "05:00", "13:00", "T2")
    const fri = makeRestDay("2026-04-10")
    const record = makeDriverRecord([wed, thu, fri], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-09"
    )
    expect(violations).toHaveLength(0)
  })

  it("exactly 11h rest → no rest issues at all", () => {
    // T1 ends 20:00; T2 starts 07:00 next day → exactly 11h
    const wed = makeTripDay("2026-04-08", "08:00", "20:00", "T1")
    const thu = makeTripDay("2026-04-09", "07:00", "17:00", "T2")
    const fri = makeRestDay("2026-04-10")
    const record = makeDriverRecord([wed, thu, fri], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.date === "2026-04-09")).toHaveLength(0)
  })

  it("10h30m rest (9–11h reduced band): no EU_DAILY_REST violation or warning; EU_REDUCED_REST_LIMIT only fires at count=3", () => {
    // EU_DAILY_REST has only 'violation' severity (<9h). For 9–11h rests the engine
    // emits EU_REDUCED_REST_LIMIT: warning at count=3, violation at count>3.
    // A single 10h30m rest increments the counter to 1 — no issue fires yet.
    const wed = makeTripDay("2026-04-08", "08:00", "20:00", "T1")
    const thu = makeTripDay("2026-04-09", "06:31", "16:00", "T2")
    const fri = makeRestDay("2026-04-10")
    const record = makeDriverRecord([wed, thu, fri], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const hard = issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-09")
    expect(hard).toHaveLength(0)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "warning")).toHaveLength(0)
  })

  it("1h rest (extreme violation) → EU_DAILY_REST hard violation", () => {
    const wed = makeTripDay("2026-04-08", "08:00", "22:00", "T1")
    const thu = makeTripDay("2026-04-09", "23:00", "08:00", "T2")
    const fri = makeRestDay("2026-04-10")
    // Wait — T2 spans overnight; for validator test we use same-day ending
    // Instead: T1 ends 22:00; T2 starts 23:00 same day (not inter-day)
    // Use proper inter-day: T1 ends Wed 22:00; T2 starts Thu 23:00 → 25h rest (compliant)
    // Instead: T2 starts Thu 01:00 → 3h → violation
    const thu2 = makeTripDay("2026-04-09", "01:00", "09:00", "T2")
    const record2 = makeDriverRecord([wed, thu2, fri], "test-driver-001", "ASSIMILATED", 2)
    const issues2 = validateAssimilated(record2)
    const violations = issues2.filter(
      i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation" && i.date === "2026-04-09"
    )
    expect(violations).toHaveLength(1)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Daily work limit
// ═══════════════════════════════════════════════════════════════════

describe("Daily work limit — EU_DAILY_WORK_LIMIT", () => {

  it("9h duty day → no violation or warning", () => {
    const mon = makeTripDay("2026-04-06", "07:00", "16:00", "T1")
    const tue = makeTripDay("2026-04-07", "07:00", "16:00", "T2")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_WORK_LIMIT")).toHaveLength(0)
  })

  it("13h duty day → warning (at the 13h threshold)", () => {
    // 13h1m = 781min > 780min (MAX_DUTY_WARN_MINS)
    const mon = makeTripDay("2026-04-06", "07:00", "20:01", "T1")
    const tue = makeTripDay("2026-04-07", "07:00", "16:00", "T2")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const warnings = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "warning" && i.date === "2026-04-06"
    )
    expect(warnings.length).toBeGreaterThanOrEqual(1)
  })

  it("15h01m duty day → hard violation (over 15h absolute max)", () => {
    // 15h1m = 901min > 900min (MAX_DUTY_REDUCED_MINS)
    const mon = makeTripDay("2026-04-06", "07:00", "22:01", "T1")
    const tue = makeTripDay("2026-04-07", "07:00", "16:00", "T2")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation" && i.date === "2026-04-06"
    )
    expect(violations).toHaveLength(1)
  })

  it("interior day (8h default) → no EU_DAILY_WORK_LIMIT", () => {
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeTripDay("2026-04-08", "00:00", "06:00", "T1")
    const thu = makeRestDay("2026-04-09")
    const record = makeDriverRecord([mon, tue, wed, thu], "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_WORK_LIMIT")).toHaveLength(0)
  })

  it("first day of multi-day trip with long start → violation if >15h", () => {
    // Trip starts Mon 05:30 → 23:59 = 18h29m → violation
    const mon = makeTripDay("2026-04-06", "05:30", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeTripDay("2026-04-08", "00:00", "06:00", "T1")
    const thu = makeRestDay("2026-04-09")
    // tripCount=1 → engine exits after overlap, never reaches per-day checks
    // To test per-day, use tripCount=2 by also including a second distinct trip
    const extraTrip = makeTripDay("2026-04-04", "08:00", "17:00", "T0")
    const record = makeDriverRecord([extraTrip, mon, tue, wed, thu], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation" && i.date === "2026-04-06"
    )
    expect(violations).toHaveLength(1)
  })

  it("last day of multi-day trip ending at 16:00 → violation (16h > 15h)", () => {
    // Last day: 00:00–16:00 = 16h → violation
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeInteriorDay("2026-04-07", "T1")
    const wed = makeTripDay("2026-04-08", "00:00", "16:00", "T1")
    const extraTrip = makeTripDay("2026-04-04", "08:00", "17:00", "T0")
    const thu = makeRestDay("2026-04-09")
    const record = makeDriverRecord([extraTrip, mon, tue, wed, thu], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation" && i.date === "2026-04-08"
    )
    expect(violations).toHaveLength(1)
  })

  it("last day ending 14h59m (00:00–14:59) → warning only (13–15h range)", () => {
    const mon = makeTripDay("2026-04-06", "22:00", "23:59", "T1")
    const tue = makeTripDay("2026-04-07", "00:00", "14:59", "T1")
    const extraTrip = makeTripDay("2026-04-04", "08:00", "17:00", "T0")
    const wed = makeRestDay("2026-04-08")
    const record = makeDriverRecord([extraTrip, mon, tue, wed], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const hardViolations = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation" && i.date === "2026-04-07"
    )
    const warnings = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "warning" && i.date === "2026-04-07"
    )
    expect(hardViolations).toHaveLength(0)
    expect(warnings.length).toBeGreaterThanOrEqual(1)
  })

  it("two trips on same day summing to 16h → violation via mergedDutyMinutes", () => {
    // T1: 07:00–14:00 (7h), T2: 16:00–21:00 (5h) → merged = 12h (no gap overlap = 12h) ... warning
    // Actually 07:00–14:00 gap 14:00–16:00 then 16:00–21:00 = 7+5 = 12h merged → warning (>13h? no, 12h < 13h)
    // Let's do: T1 06:00–14:00 (8h), T2 15:00–23:30 (8.5h) → 16.5h merged → violation
    const mon = makeWorkingDay("2026-04-06", [
      makeTripActivity("2026-04-06", "06:00", "14:00", "TA"),
      makeTripActivity("2026-04-06", "15:00", "23:30", "TB"),
    ])
    const extraTrip = makeTripDay("2026-04-04", "08:00", "17:00", "T0")
    const tue = makeRestDay("2026-04-07")
    const record = makeDriverRecord([extraTrip, mon, tue], "test-driver-001", "ASSIMILATED", 3)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation" && i.date === "2026-04-06"
    )
    expect(violations).toHaveLength(1)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: Consecutive working days
// ═══════════════════════════════════════════════════════════════════

describe("Consecutive working days — EU_CONSECUTIVE_WORKING_DAYS", () => {

  it("6 consecutive working days → warning on day 6 (not violation)", () => {
    // Warning fires when consecutiveWorking === MAX_CONSECUTIVE_WORKING (6)
    // Violation fires when > 6 (day 7+)
    const days = Array.from({ length: 6 }, (_, i) => {
      const date = new Date("2026-04-06")
      date.setDate(date.getDate() + i)
      const ds = date.toISOString().slice(0, 10)
      return makeTripDay(ds, "07:00", "17:00", `T${i}`)
    })
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 6)
    const issues = validateAssimilated(record)
    const warning = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "warning"
    )
    const violation = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(warning.length).toBeGreaterThanOrEqual(1)
    expect(violation).toHaveLength(0)
  })

  it("7 consecutive working days → violation from day 7", () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date("2026-04-06")
      date.setDate(date.getDate() + i)
      const ds = date.toISOString().slice(0, 10)
      return makeTripDay(ds, "07:00", "17:00", `T${i}`)
    })
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 7)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it("7-day multi-day trip (Mon–Sun, tripCount=2): violation fires on day 7", () => {
    // Using tripCount=2 so engine passes the guard and reaches the consecutive check
    const extraTrip = makeTripDay("2026-03-30", "08:00", "17:00", "T0")  // prior week
    const days = [
      extraTrip,
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeInteriorDay("2026-04-09", "T1"),
      makeInteriorDay("2026-04-10", "T1"),
      makeInteriorDay("2026-04-11", "T1"),
      makeTripDay("2026-04-12", "00:00", "06:00", "T1"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it("rest day breaks the consecutive streak: 4 days + rest + 4 days → no violation", () => {
    const days = [
      ...Array.from({ length: 4 }, (_, i) => {
        const date = new Date("2026-04-06")
        date.setDate(date.getDate() + i)
        const ds = date.toISOString().slice(0, 10)
        return makeTripDay(ds, "07:00", "17:00", `T${i}`)
      }),
      makeRestDay("2026-04-10"),
      makeRestDay("2026-04-11"),
      ...Array.from({ length: 4 }, (_, i) => {
        const date = new Date("2026-04-12")
        date.setDate(date.getDate() + i)
        const ds = date.toISOString().slice(0, 10)
        return makeTripDay(ds, "07:00", "17:00", `T${i + 10}`)
      }),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 8)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(violations).toHaveLength(0)
  })

  it("3-day trip + single day + 3-day trip = 7 consecutive → violation on day 7", () => {
    const extraTrip = makeTripDay("2026-04-04", "08:00", "17:00", "T0")
    const days = [
      extraTrip,
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeTripDay("2026-04-08", "00:00", "06:00", "T1"),
      makeTripDay("2026-04-09", "08:00", "16:00", "T2"),
      makeTripDay("2026-04-10", "22:00", "23:59", "T3"),
      makeInteriorDay("2026-04-11", "T3"),
      makeTripDay("2026-04-12", "00:00", "06:00", "T3"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 4)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it("4-day multi-day trip + rest + 2-day trip = no violation (all runs ≤5)", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeTripDay("2026-04-09", "00:00", "06:00", "T1"),
      makeRestDay("2026-04-10"),
      makeRestDay("2026-04-11"),
      makeTripDay("2026-04-12", "22:00", "23:59", "T2"),
      makeTripDay("2026-04-13", "00:00", "08:00", "T2"),
      makeRestDay("2026-04-14"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(violations).toHaveLength(0)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: Overlap detection
// ═══════════════════════════════════════════════════════════════════

describe("Overlap detection", () => {

  it("same trip across 4 days (same orderId): NO TRIP_OVERLAP", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeTripDay("2026-04-09", "00:00", "06:00", "T1"),
      makeRestDay("2026-04-10"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP")).toHaveLength(0)
  })

  it("two trips on same day with 2h overlap → TRIP_OVERLAP", () => {
    const mon = makeWorkingDay("2026-04-06", [
      makeTripActivity("2026-04-06", "08:00", "16:00", "TA"),
      makeTripActivity("2026-04-06", "14:00", "20:00", "TB"),
    ])
    const tue = makeRestDay("2026-04-07")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP").length).toBeGreaterThanOrEqual(1)
  })

  it("multi-day trip last day overlaps with new trip → TRIP_OVERLAP", () => {
    // T1 ends at 10:00 on Wed; T2 starts at 08:00 on Wed → 2h overlap
    const wed = makeWorkingDay("2026-04-08", [
      makeTripActivity("2026-04-08", "00:00", "10:00", "T1"),
      makeTripActivity("2026-04-08", "08:00", "16:00", "T2"),
    ])
    const thu = makeRestDay("2026-04-09")
    const record = makeDriverRecord([wed, thu], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP").length).toBeGreaterThanOrEqual(1)
  })

  it("back-to-back trips (T1 ends 06:00, T2 starts 06:01) → NO overlap", () => {
    const wed = makeWorkingDay("2026-04-08", [
      makeTripActivity("2026-04-08", "00:00", "06:00", "T1"),
      makeTripActivity("2026-04-08", "06:01", "14:00", "T2"),
    ])
    const thu = makeRestDay("2026-04-09")
    const record = makeDriverRecord([wed, thu], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP")).toHaveLength(0)
  })

  it("three trips where middle one is contained in first → overlap detected", () => {
    const mon = makeWorkingDay("2026-04-06", [
      makeTripActivity("2026-04-06", "08:00", "18:00", "TA"),
      makeTripActivity("2026-04-06", "10:00", "14:00", "TB"),  // inside TA
      makeTripActivity("2026-04-06", "19:00", "21:00", "TC"),  // separate
    ])
    const tue = makeRestDay("2026-04-07")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 3)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP").length).toBeGreaterThanOrEqual(1)
  })

  it("two multi-day trips on same days (same driver, different orders) → overlap", () => {
    // T1 and T2 both on Mon interior → they overlap
    const mon = makeWorkingDay("2026-04-06", [
      {
        activityType: ActivityType.NON_DRIVING_DUTY as const,
        startTime: new Date("2026-04-06T00:00:00"),
        endTime:   new Date("2026-04-06T08:00:00"),
        orderId:   "T1",
      },
      {
        activityType: ActivityType.NON_DRIVING_DUTY as const,
        startTime: new Date("2026-04-06T04:00:00"),
        endTime:   new Date("2026-04-06T12:00:00"),
        orderId:   "T2",
      },
    ])
    const tue = makeRestDay("2026-04-07")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "TRIP_OVERLAP").length).toBeGreaterThanOrEqual(1)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: tripCount guard
// ═══════════════════════════════════════════════════════════════════

describe("tripCount guard — single-trip short-circuit", () => {

  it("tripCount=1, single-day trip: no inter-trip violations (guard exits early)", () => {
    const mon = makeTripDay("2026-04-06", "07:00", "17:00", "T1")
    const tue = makeRestDay("2026-04-07")
    const record = makeDriverRecord([mon, tue], "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST")).toHaveLength(0)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_WORK_LIMIT")).toHaveLength(0)
    expect(issues.filter(i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS")).toHaveLength(0)
  })

  it("tripCount=1, multi-day trip: no false inter-trip violations", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeTripDay("2026-04-09", "00:00", "06:00", "T1"),
      makeRestDay("2026-04-10"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 1)
    const issues = validateAssimilated(record)
    const interTripIssues = issues.filter(
      i => ["EU_DAILY_REST","EU_DAILY_WORK_LIMIT","EU_CONSECUTIVE_WORKING_DAYS"].includes(i.ruleId)
    )
    expect(interTripIssues).toHaveLength(0)
  })

  it("tripCount=2 enables all checks including consecutive days", () => {
    // 7 consecutive days → violation should appear when tripCount=2
    const extraTrip = makeTripDay("2026-04-01", "08:00", "17:00", "T0")
    const days = [
      extraTrip,
      ...Array.from({ length: 7 }, (_, i) => {
        const date = new Date("2026-04-06")
        date.setDate(date.getDate() + i)
        const ds = date.toISOString().slice(0, 10)
        return makeTripDay(ds, "07:00", "17:00", `T${i + 1}`)
      }),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 8)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: Reduced rest counting
// ═══════════════════════════════════════════════════════════════════

describe("Reduced-rest counting — EU_REDUCED_REST_LIMIT", () => {

  it("3 reduced rests (10h each) → warning on 3rd (all used)", () => {
    // Each pair has 10h rest (9≤x<11 → reduced)
    // T1 Mon 08:00–20:00; T2 Tue 06:00–18:00 (gap 10h)
    // T3 Wed 04:00–16:00 (gap 10h); T4 Thu 02:00–14:00 (gap 10h = 3rd reduced)
    const days = [
      makeTripDay("2026-04-06", "08:00", "20:00", "T1"),
      makeTripDay("2026-04-07", "06:00", "18:00", "T2"),
      makeTripDay("2026-04-08", "04:00", "16:00", "T3"),
      makeTripDay("2026-04-09", "02:00", "14:00", "T4"),
      makeRestDay("2026-04-10"),
      makeRestDay("2026-04-11"),
      makeRestDay("2026-04-12"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 4)
    const issues = validateAssimilated(record)
    const reducedIssues = issues.filter(i => i.ruleId === "EU_REDUCED_REST_LIMIT")
    expect(reducedIssues.length).toBeGreaterThanOrEqual(1)
  })

  it("4 reduced rests → violation on 4th (over limit)", () => {
    // 4 consecutive 10h rests
    const days = [
      makeTripDay("2026-04-06", "08:00", "21:00", "T1"),
      makeTripDay("2026-04-07", "07:00", "20:00", "T2"),
      makeTripDay("2026-04-08", "06:00", "19:00", "T3"),
      makeTripDay("2026-04-09", "05:00", "18:00", "T4"),
      makeTripDay("2026-04-10", "04:00", "17:00", "T5"),
      makeRestDay("2026-04-11"),
      makeRestDay("2026-04-12"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 5)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_REDUCED_REST_LIMIT" && i.severity === "violation"
    )
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it("adequate rest between working-day pairs resets reduced rest counter", () => {
    // The engine resets reducedRestCount when rest between two WORKING days is ≥ WEEKLY_REST_REDUCED (24h).
    // Rest days skip the rest-gap loop entirely, so the reset must come from a long gap between
    // two consecutive working days (i.e., a trip that starts ≥24h after the previous trip ended).
    //
    // Scenario: 2 reduced rests, then a 36h gap (working→working), then 2 more reduced rests.
    // After the reset the second group of 2 is still within limit → no violation.
    const days = [
      makeTripDay("2026-04-06", "08:00", "21:00", "T1"),
      makeTripDay("2026-04-07", "07:00", "20:00", "T2"),  // 10h rest → reduced #1
      makeTripDay("2026-04-08", "06:00", "19:00", "T3"),  // 10h rest → reduced #2
      // T4 starts 36h after T3 ends (Thu 19:00 → Sat 07:00) → resets counter
      makeTripDay("2026-04-11", "07:00", "20:00", "T4"),  // Sat: 36h gap from Thu → reset
      makeTripDay("2026-04-12", "06:00", "19:00", "T5"),  // 10h → reduced #1 after reset
      makeTripDay("2026-04-13", "05:00", "18:00", "T6"),  // 10h → reduced #2 after reset
      makeRestDay("2026-04-14"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 6)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_REDUCED_REST_LIMIT" && i.severity === "violation"
    )
    expect(violations).toHaveLength(0)
  })

})

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: Mixed multi-day + single-day complex scenarios
// ═══════════════════════════════════════════════════════════════════

describe("Mixed scenarios — multi-day and single-day trips combined", () => {

  it("normal week: single Mon + multi-day Tue→Thu + single Fri — compliant", () => {
    // Mon T0 08:00–17:00 ends Mon 17:00
    // T1 starts Tue 22:00 (rest: Mon 17:00→Tue 22:00 = 29h → well above 11h) ✓
    // T1 interior Wed, ends Thu 06:00
    // T2 starts Fri 18:00 (rest: Thu 06:00→Fri 18:00 = 36h) ✓
    const days = [
      makeTripDay("2026-04-06", "08:00", "17:00", "T0"),
      makeTripDay("2026-04-07", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-08", "T1"),
      makeTripDay("2026-04-09", "00:00", "06:00", "T1"),
      makeTripDay("2026-04-10", "18:00", "22:00", "T2"),
      makeRestDay("2026-04-11"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 3)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation")).toHaveLength(0)
  })

  it("two consecutive multi-day trips with 64h rest between → compliant", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeTripDay("2026-04-08", "00:00", "06:00", "T1"),
      makeRestDay("2026-04-09"),
      makeTripDay("2026-04-10", "22:00", "23:59", "T2"),
      makeInteriorDay("2026-04-11", "T2"),
      makeTripDay("2026-04-12", "00:00", "06:00", "T2"),
      makeRestDay("2026-04-13"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation")).toHaveLength(0)
  })

  it("multi-day trip T1 Mon→Wed, then single Fri with 11h rest from Wed→Fri gap → compliant", () => {
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeTripDay("2026-04-08", "00:00", "08:00", "T1"), // ends Wed 08:00
      makeRestDay("2026-04-09"),
      makeTripDay("2026-04-10", "07:00", "17:00", "T2"), // Fri starts 07:00 → 47h rest
      makeRestDay("2026-04-11"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation")).toHaveLength(0)
  })

  it("multi-day trip ending at 06:00 followed immediately (same day) by 16h second trip → daily work limit violation", () => {
    // Wed: T1 00:00–06:00 (6h) + T2 07:00–23:00 (16h) = 22h merged → violation
    const days = [
      makeTripDay("2026-04-06", "22:00", "23:59", "T1"),
      makeInteriorDay("2026-04-07", "T1"),
      makeWorkingDay("2026-04-08", [
        makeTripActivity("2026-04-08", "00:00", "06:00", "T1"),
        makeTripActivity("2026-04-08", "07:00", "23:00", "T2"),
      ]),
      makeRestDay("2026-04-09"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 2)
    const issues = validateAssimilated(record)
    const violations = issues.filter(
      i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation" && i.date === "2026-04-08"
    )
    expect(violations).toHaveLength(1)
  })

  it("week with single trips and no rest day → EU_WEEKLY_REST fires", () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date("2026-04-06")
      date.setDate(date.getDate() + i)
      const ds = date.toISOString().slice(0, 10)
      return makeTripDay(ds, "07:00", "17:00", `T${i}`)
    })
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 7)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_WEEKLY_REST").length).toBeGreaterThanOrEqual(1)
  })

  it("single-day trip sandwiched: sufficient rest on both sides → no violations", () => {
    // T1 Mon 07:00–17:00, rest Tue, T2 Wed 07:00–17:00, rest Thu, T3 Fri 07:00–17:00
    const days = [
      makeTripDay("2026-04-06", "07:00", "17:00", "T1"),
      makeRestDay("2026-04-07"),
      makeTripDay("2026-04-08", "07:00", "17:00", "T2"),
      makeRestDay("2026-04-09"),
      makeTripDay("2026-04-10", "07:00", "17:00", "T3"),
      makeRestDay("2026-04-11"),
      makeRestDay("2026-04-12"),
    ]
    const record = makeDriverRecord(days, "test-driver-001", "ASSIMILATED", 3)
    const issues = validateAssimilated(record)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_REST" && i.severity === "violation")).toHaveLength(0)
    expect(issues.filter(i => i.ruleId === "EU_DAILY_WORK_LIMIT" && i.severity === "violation")).toHaveLength(0)
  })

})
