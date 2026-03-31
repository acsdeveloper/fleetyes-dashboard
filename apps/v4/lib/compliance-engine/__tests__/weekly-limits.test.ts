import { describe, it, expect } from "vitest"
import { validateAssimilated } from "../assimilated"
import { ActivityType } from "../types"
import {
  makeActivity,
  makeWorkingDay,
  makeRestDay,
  makeDriverRecord,
} from "./helpers"

describe("validateAssimilated — Weekly Driving Limit", () => {
  it("no violation when weekly driving <56h", () => {
    // 5 days × 10h driving = 50h, under 56h limit
    const days = Array.from({ length: 5 }, (_, i) => {
      const date = `2026-04-0${i + 1}`
      return makeWorkingDay(date, [
        makeActivity(date, "06:00", "16:00", ActivityType.DRIVING),
      ])
    })
    // Add rest days to complete the week
    days.push(makeRestDay("2026-04-06"))
    days.push(makeRestDay("2026-04-07"))

    const record = makeDriverRecord(days)
    const issues = validateAssimilated(record)
    const weeklyIssues = issues.filter(i => i.ruleId === "EU_WEEKLY_DRIVE_LIMIT")
    // Should not have a violation (may have a warning since 50h > 50h threshold)
    const violations = weeklyIssues.filter(i => i.severity === "violation")
    expect(violations).toHaveLength(0)
  })
})

describe("validateAssimilated — Consecutive Working Days", () => {
  it("warns at 6 consecutive working days", () => {
    const days = Array.from({ length: 6 }, (_, i) => {
      const date = `2026-04-0${i + 1}`
      return makeWorkingDay(date, [
        makeActivity(date, "08:00", "16:00"),
      ])
    })
    const record = makeDriverRecord(days)
    const issues = validateAssimilated(record)
    const consecIssues = issues.filter(i => i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS")
    // 6 consecutive: should have at least a warning
    expect(consecIssues.length).toBeGreaterThanOrEqual(1)
  })

  it("violation at 7+ consecutive working days", () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = i + 1
      const date = `2026-04-${String(d).padStart(2, "0")}`
      return makeWorkingDay(date, [
        makeActivity(date, "08:00", "16:00"),
      ])
    })
    const record = makeDriverRecord(days)
    const issues = validateAssimilated(record)
    const consecViolations = issues.filter(i =>
      i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    expect(consecViolations.length).toBeGreaterThanOrEqual(1)
  })

  it("rest day resets consecutive count", () => {
    // 5 working days, 1 rest day, 5 working days
    const days = []
    for (let i = 1; i <= 5; i++) {
      const date = `2026-04-${String(i).padStart(2, "0")}`
      days.push(makeWorkingDay(date, [
        makeActivity(date, "08:00", "16:00"),
      ]))
    }
    days.push(makeRestDay("2026-04-06"))
    for (let i = 7; i <= 11; i++) {
      const date = `2026-04-${String(i).padStart(2, "0")}`
      days.push(makeWorkingDay(date, [
        makeActivity(date, "08:00", "16:00"),
      ]))
    }
    const record = makeDriverRecord(days)
    const issues = validateAssimilated(record)
    const consecViolations = issues.filter(i =>
      i.ruleId === "EU_CONSECUTIVE_WORKING_DAYS" && i.severity === "violation"
    )
    // Never reaches 7 consecutive — should have no violation
    expect(consecViolations).toHaveLength(0)
  })
})
