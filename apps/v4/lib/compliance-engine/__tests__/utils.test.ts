import { describe, it, expect } from "vitest"
import {
  activityMinutes,
  fmtMinutes,
  restBetweenDays,
  longestContinuousRest,
  isoWeekMonday,
  toDateStr,
  checkAssimilatedBreaks,
  mergedDutyMinutes,
} from "../utils"
import { ActivityType } from "../types"
import { makeActivity, makeWorkingDay } from "./helpers"

describe("activityMinutes", () => {
  it("calculates duration correctly", () => {
    const a = makeActivity("2026-04-01", "09:00", "11:30")
    expect(activityMinutes(a)).toBe(150) // 2.5h
  })

  it("returns 0 for zero-length activity", () => {
    const a = makeActivity("2026-04-01", "09:00", "09:00")
    expect(activityMinutes(a)).toBe(0)
  })
})

describe("fmtMinutes", () => {
  it("formats minutes only", () => {
    expect(fmtMinutes(30)).toBe("30m")
  })

  it("formats hours only", () => {
    expect(fmtMinutes(120)).toBe("2h")
  })

  it("formats hours and minutes", () => {
    expect(fmtMinutes(150)).toBe("2h 30m")
  })

  it("formats zero", () => {
    expect(fmtMinutes(0)).toBe("0m")
  })
})

describe("restBetweenDays", () => {
  it("calculates rest between consecutive days", () => {
    // Day 1 ends at 17:00, Day 2 starts at 06:00 → 13h rest
    const day1 = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "06:00", "17:00"),
    ])
    const day2 = makeWorkingDay("2026-04-02", [
      makeActivity("2026-04-02", "06:00", "17:00"),
    ])
    expect(restBetweenDays(day1, day2)).toBe(780) // 13h = 780min
  })

  it("returns 0 for days with no activities", () => {
    const day1 = makeWorkingDay("2026-04-01", [])
    const day2 = makeWorkingDay("2026-04-02", [])
    expect(restBetweenDays(day1, day2)).toBe(0)
  })

  it("handles cross-midnight correctly", () => {
    // Day 1 ends at 23:00, Day 2 starts at 01:00 → 2h rest
    const day1 = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "14:00", "23:00"),
    ])
    const day2 = makeWorkingDay("2026-04-02", [
      makeActivity("2026-04-02", "01:00", "10:00"),
    ])
    expect(restBetweenDays(day1, day2)).toBe(120) // 2h
  })
})

describe("isoWeekMonday", () => {
  it("returns Monday for a Monday", () => {
    // 2026-04-06 is a Monday
    const mon = isoWeekMonday("2026-04-06")
    expect(toDateStr(mon)).toBe("2026-04-06")
  })

  it("returns Monday for a Wednesday", () => {
    // 2026-04-08 is a Wednesday → Monday is 2026-04-06
    const mon = isoWeekMonday("2026-04-08")
    expect(toDateStr(mon)).toBe("2026-04-06")
  })

  it("returns Monday for a Sunday", () => {
    // 2026-04-12 is a Sunday → Monday is 2026-04-06
    const mon = isoWeekMonday("2026-04-12")
    expect(toDateStr(mon)).toBe("2026-04-06")
  })
})

describe("longestContinuousRest", () => {
  it("finds the longest gap between duty activities", () => {
    // Activities: 08:00-10:00, gap 6h (10:00-16:00), 16:00-18:00
    // But also: gap before first activity = 00:00-08:00 = 8h = 480min
    // And: gap after last activity = 18:00-23:59 ~= 360min
    // longestContinuousRest returns the LARGEST gap = 480min
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "08:00", "10:00"),
      makeActivity("2026-04-01", "16:00", "18:00"),
    ])
    const rest = longestContinuousRest([day])
    expect(rest).toBe(480) // 8h gap before first activity (00:00-08:00)
  })
})

describe("checkAssimilatedBreaks", () => {
  it("is satisfied with a 45min break in 4.5h", () => {
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "06:00", "10:30", ActivityType.DRIVING),
      makeActivity("2026-04-01", "10:30", "11:15", ActivityType.BREAK),
      makeActivity("2026-04-01", "11:15", "14:00", ActivityType.DRIVING),
    ])
    const result = checkAssimilatedBreaks(day)
    expect(result.isSatisfied).toBe(true)
  })

  it("is violated with 5h driving and no break", () => {
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "06:00", "11:00", ActivityType.DRIVING),
    ])
    const result = checkAssimilatedBreaks(day)
    expect(result.isSatisfied).toBe(false)
  })

  it("accepts split break (15min + 30min)", () => {
    const day = makeWorkingDay("2026-04-01", [
      makeActivity("2026-04-01", "06:00", "08:00", ActivityType.DRIVING),
      makeActivity("2026-04-01", "08:00", "08:15", ActivityType.BREAK),
      makeActivity("2026-04-01", "08:15", "10:30", ActivityType.DRIVING),
      makeActivity("2026-04-01", "10:30", "11:00", ActivityType.BREAK),
      makeActivity("2026-04-01", "11:00", "14:00", ActivityType.DRIVING),
    ])
    const result = checkAssimilatedBreaks(day)
    expect(result.isSatisfied).toBe(true)
  })
})

describe("mergedDutyMinutes", () => {
  it("handles single activity", () => {
    const a = makeActivity("2026-04-01", "09:00", "17:00")
    expect(mergedDutyMinutes([a])).toBe(480) // 8h
  })

  it("handles three overlapping activities", () => {
    const a = makeActivity("2026-04-01", "08:00", "12:00")
    const b = makeActivity("2026-04-01", "10:00", "14:00")
    const c = makeActivity("2026-04-01", "13:00", "16:00")
    expect(mergedDutyMinutes([a, b, c])).toBe(480) // 08:00-16:00 = 8h
  })
})
