/**
 * Prospective Check — Rest Gap Detection Tests
 * ─────────────────────────────────────────────────
 *
 * Tests the prospectiveComplianceCheck function with Order-shaped data
 * (as the API returns it), NOT pre-built Activity objects. This catches
 * data-conversion bugs that unit-test-only helpers would miss.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { prospectiveComplianceCheck } from "../prospective-check"
import type { Order } from "../../orders-api"

// Mock rota-store so prospective check doesn't depend on localStorage
vi.mock("../../rota-store", () => ({
  getAllRota: () => [],
}))

/** Build a minimal Order with the fields the compliance engine needs */
function fakeOrder(overrides: Partial<Order> & { uuid: string }): Order {
  return {
    id: overrides.uuid,
    public_id: `ORD-${overrides.uuid}`,
    status: "created",
    dispatched: false,
    started: false,
    created_at: overrides.scheduled_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Order
}

describe("prospectiveComplianceCheck — rest gap detection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("catches 2h rest gap when estimated_end_date IS provided (overnight trip)", () => {
    // Trip A: already assigned, 18:00 Day 1 → 05:29 Day 2
    const existingTrip = fakeOrder({
      uuid: "trip-a",
      scheduled_at: "2026-04-01 18:00:00",
      estimated_end_date: "2026-04-02 05:29:00",
      time: 41340, // 11h29m in seconds
      driver_assigned_uuid: "driver-1",
    })

    // Trip B: being dropped, 07:31 Day 2
    const newTrip = fakeOrder({
      uuid: "trip-b",
      scheduled_at: "2026-04-02 07:31:00",
      estimated_end_date: "2026-04-02 15:00:00",
      time: 26940,
    })

    const tripIndex = new Map<string, Order>()
    tripIndex.set(existingTrip.uuid, existingTrip)

    const result = prospectiveComplianceCheck("driver-1", "2026-04-02", newTrip, tripIndex)

    expect(result.violations.length).toBeGreaterThanOrEqual(1)
    expect(result.violations[0].ruleId).toBe("EU_DAILY_REST")
    expect(result.violations[0].calculation).toContain("2h")
  })

  it("uses 2h fallback when existing trip has no end time — does not block assignment", () => {
    // Trip A: overnight BUT API returns estimated_end_date: null, time: 0
    // Engine uses 2h fallback: trip-a end = 18:00 + 2h = 20:00
    // Gap from 20:00 Day 1 → 07:31 Day 2 = 11h31m ≥ 9h min → no violation
    const existingTrip = fakeOrder({
      uuid: "trip-a",
      scheduled_at: "2026-04-01 18:00:00",
      estimated_end_date: null,
      time: 0,
      driver_assigned_uuid: "driver-1",
    })

    const newTrip = fakeOrder({
      uuid: "trip-b",
      scheduled_at: "2026-04-02 07:31:00",
      estimated_end_date: "2026-04-02 15:00:00",
      time: 26940,
    })

    const tripIndex = new Map<string, Order>()
    tripIndex.set(existingTrip.uuid, existingTrip)

    const result = prospectiveComplianceCheck("driver-1", "2026-04-02", newTrip, tripIndex)

    // After D-04: MISSING_END_TIME block removed. Assignment is not blocked.
    // The 2h fallback approximates trip-a end as 20:00 → gap = 11h31m → no rest violation.
    expect(result.violations.length).toBe(0) // correctly: no violation for newTrip with valid end time
  })


  it("catches gap when estimated_end_date is null BUT time field is accurate", () => {
    // Trip A: no estimated_end_date but time = 41340 seconds (11h29m)
    // 18:00 + 11h29m = 05:29 next day → gap to 07:31 = 2h2m → violation
    const existingTrip = fakeOrder({
      uuid: "trip-a",
      scheduled_at: "2026-04-01 18:00:00",
      estimated_end_date: null,
      time: 41340, // 11h29m in seconds — accurate
      driver_assigned_uuid: "driver-1",
    })

    const newTrip = fakeOrder({
      uuid: "trip-b",
      scheduled_at: "2026-04-02 07:31:00",
      estimated_end_date: "2026-04-02 15:00:00",
      time: 26940,
    })

    const tripIndex = new Map<string, Order>()
    tripIndex.set(existingTrip.uuid, existingTrip)

    const result = prospectiveComplianceCheck("driver-1", "2026-04-02", newTrip, tripIndex)

    expect(result.violations.length).toBeGreaterThanOrEqual(1)
    expect(result.violations[0].ruleId).toBe("EU_DAILY_REST")
  })
})
