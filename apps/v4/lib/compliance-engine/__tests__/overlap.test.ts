import { describe, it, expect } from "vitest"
import { detectOverlaps, mergedDutyMinutes } from "../utils"
import { validateAssimilated } from "../assimilated"
import { validateGBDomesticGoods } from "../gb-domestic-goods"
import { ActivityType } from "../types"
import {
  makeActivity,
  makeOvernightActivity,
  makeWorkingDay,
  makeDriverRecord,
} from "./helpers"

// ─── detectOverlaps ──────────────────────────────────────────────────────────

describe("detectOverlaps", () => {
  it("detects same-day overlap", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00")
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    const result = detectOverlaps([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].overlapMinutes).toBe(60)
  })

  it("allows back-to-back (zero gap)", () => {
    const a = makeActivity("2026-04-01", "09:00", "10:00")
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    expect(detectOverlaps([a, b])).toHaveLength(0)
  })

  it("detects full containment", () => {
    const a = makeActivity("2026-04-01", "08:00", "16:00")
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    const result = detectOverlaps([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].overlapMinutes).toBe(120)
  })

  it("ignores REST activities", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00", ActivityType.REST)
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    expect(detectOverlaps([a, b])).toHaveLength(0)
  })

  it("ignores BREAK activities", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00", ActivityType.BREAK)
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    expect(detectOverlaps([a, b])).toHaveLength(0)
  })

  it("detects cross-midnight overlap", () => {
    const a = makeOvernightActivity("2026-04-01", "22:00", "2026-04-02", "06:00")
    const b = makeActivity("2026-04-02", "05:00", "10:00")
    const result = detectOverlaps([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].overlapMinutes).toBe(60) // 05:00-06:00
  })

  it("detects multiple overlaps in a set", () => {
    const a = makeActivity("2026-04-01", "08:00", "11:00")
    const b = makeActivity("2026-04-01", "10:00", "13:00")
    const c = makeActivity("2026-04-01", "12:00", "15:00")
    const result = detectOverlaps([a, b, c])
    // a overlaps b (10-11), b overlaps c (12-13)
    expect(result).toHaveLength(2)
  })

  it("handles no activities", () => {
    expect(detectOverlaps([])).toHaveLength(0)
  })

  it("handles single activity", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00")
    expect(detectOverlaps([a])).toHaveLength(0)
  })

  it("handles non-overlapping activities", () => {
    const a = makeActivity("2026-04-01", "08:00", "10:00")
    const b = makeActivity("2026-04-01", "11:00", "13:00")
    const c = makeActivity("2026-04-01", "14:00", "16:00")
    expect(detectOverlaps([a, b, c])).toHaveLength(0)
  })
})

// ─── mergedDutyMinutes ───────────────────────────────────────────────────────

describe("mergedDutyMinutes", () => {
  it("sums non-overlapping correctly", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00")
    const b = makeActivity("2026-04-01", "12:00", "14:00")
    expect(mergedDutyMinutes([a, b])).toBe(240) // 4h
  })

  it("merges overlapping correctly", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00")
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    expect(mergedDutyMinutes([a, b])).toBe(180) // 3h, not 4h
  })

  it("merges fully contained", () => {
    const a = makeActivity("2026-04-01", "08:00", "16:00")
    const b = makeActivity("2026-04-01", "10:00", "12:00")
    expect(mergedDutyMinutes([a, b])).toBe(480) // 8h (outer only)
  })

  it("returns 0 for empty array", () => {
    expect(mergedDutyMinutes([])).toBe(0)
  })

  it("excludes REST and BREAK from duty calculation", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:00")
    const rest = makeActivity("2026-04-01", "11:00", "13:00", ActivityType.REST)
    expect(mergedDutyMinutes([a, rest])).toBe(120) // only the duty activity
  })
})

// ─── Batch Validator Integration ─────────────────────────────────────────────

describe("validateAssimilated — TRIP_OVERLAP", () => {
  it("flags overlapping activities as violation", () => {
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "08:00", "12:00"),
      makeActivity("2026-04-01", "10:00", "14:00"),
    ])
    const record = makeDriverRecord([day])
    const issues = validateAssimilated(record)
    const overlaps = issues.filter(i => i.ruleId === "TRIP_OVERLAP")
    expect(overlaps).toHaveLength(1)
    expect(overlaps[0].severity).toBe("violation")
  })

  it("does not flag back-to-back as overlap", () => {
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "08:00", "12:00"),
      makeActivity("2026-04-01", "12:00", "16:00"),
    ])
    const record = makeDriverRecord([day])
    const issues = validateAssimilated(record)
    const overlaps = issues.filter(i => i.ruleId === "TRIP_OVERLAP")
    expect(overlaps).toHaveLength(0)
  })

  it("detects cross-day overlap via batch validator", () => {
    const day1 = makeWorkingDay("2026-04-01", [
      makeOvernightActivity("2026-04-01", "22:00", "2026-04-02", "06:00"),
    ])
    const day2 = makeWorkingDay("2026-04-02", [
      makeActivity("2026-04-02", "05:00", "10:00"),
    ])
    const record = makeDriverRecord([day1, day2])
    const issues = validateAssimilated(record)
    const overlaps = issues.filter(i => i.ruleId === "TRIP_OVERLAP")
    expect(overlaps).toHaveLength(1)
  })
})

describe("validateGBDomesticGoods — TRIP_OVERLAP", () => {
  it("flags overlapping activities as violation", () => {
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "08:00", "12:00"),
      makeActivity("2026-04-01", "10:00", "14:00"),
    ])
    const record = makeDriverRecord([day], undefined, "GB_DOMESTIC_GOODS")
    const issues = validateGBDomesticGoods(record)
    const overlaps = issues.filter(i => i.ruleId === "TRIP_OVERLAP")
    expect(overlaps).toHaveLength(1)
    expect(overlaps[0].severity).toBe("violation")
  })
})
