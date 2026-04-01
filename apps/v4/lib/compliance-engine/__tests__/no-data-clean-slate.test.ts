/**
 * Clean-Slate Driver Tests
 * ─────────────────────────
 * When a driver has no trip history (new business or no records in the
 * 29-day window), the engine must produce ZERO hard violations.
 * The driver is assumed to have been resting during any period with no
 * trip data — this is the "new business" assumption (D-01).
 *
 * This test guards against false positives for new accounts.
 */
import { describe, it, expect } from "vitest"
import { validateAssimilated } from "../assimilated"
import { ActivityType } from "../types"
import { makeActivity, makeWorkingDay, makeRestDay, makeDriverRecord } from "./helpers"

describe("validateAssimilated — Clean-Slate Driver (No Trip Data)", () => {

  it("produces zero hard violations when driver has 29 days of no trips", () => {
    // Build 29 consecutive rest days — simulates a brand-new driver account
    const base = new Date("2026-01-01")
    const days = Array.from({ length: 29 }, (_, i) => {
      const d = new Date(base)
      d.setDate(d.getDate() + i)
      return makeRestDay(d.toISOString().slice(0, 10))
    })
    const record = makeDriverRecord(days)
    const issues = validateAssimilated(record)
    const hardViolations = issues.filter((i) => i.severity === "violation")
    expect(hardViolations).toHaveLength(0)
  })

  it("produces zero hard violations for a single compliant 8h working day with surrounding rest", () => {
    // Wed work (8h NDT) within a week containing Mon/Tue and Thu–Sun rest
    // longestContinuousRest will see Thu–Sun (≥ 45h) → compliant weekly rest
    const mon = makeRestDay("2026-02-09")
    const tue = makeRestDay("2026-02-10")
    const wed = makeWorkingDay("2026-02-11", [
      makeActivity("2026-02-11", "08:00", "16:00", ActivityType.NON_DRIVING_DUTY),
    ])
    const thu = makeRestDay("2026-02-12")
    const fri = makeRestDay("2026-02-13")
    const sat = makeRestDay("2026-02-14")
    const sun = makeRestDay("2026-02-15")
    const record = makeDriverRecord([mon, tue, wed, thu, fri, sat, sun])
    const issues = validateAssimilated(record)
    const hardViolations = issues.filter((i) => i.severity === "violation")
    expect(hardViolations).toHaveLength(0)
  })

  it("produces zero hard violations for a driver with no workingDays at all", () => {
    // Completely empty driver record — edge case for the engine
    const record = makeDriverRecord([])
    const issues = validateAssimilated(record)
    expect(issues).toHaveLength(0)
  })

})
