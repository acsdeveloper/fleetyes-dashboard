/**
 * Integration tests for off-shift recurring leave plan lifecycle
 * Actual API: work_days/off_days rotation model (not day_of_week)
 * Exported functions: listOffShifts, createOffShift, getOffShift, updateOffShift, deleteOffShift
 * Run with:  npx vitest run __tests__/off-shift-integration.test.ts
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

vi.mock("@/lib/ontrack-api", () => ({
  getToken: () => "test-bearer-token",
}))

import {
  listOffShifts,
  createOffShift,
  getOffShift,
  updateOffShift,
  deleteOffShift,
  type OffShiftPlan,
  type OffShiftCreateResponse,
  type OffShiftListResponse,
} from "@/lib/off-shift-api"

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makePlan(overrides: Partial<OffShiftPlan> = {}): OffShiftPlan {
  return {
    uuid:               "plan-uuid-1",
    public_id:          "OSP-001",
    driver_uuid:        "driver-uuid-1",
    work_days:          5,
    off_days:           2,
    first_leave_day:    "2025-01-04",
    plan_calendar_upto: "2025-12-27",
    ...overrides,
  }
}

function makeCreateResponse(plan: OffShiftPlan): OffShiftCreateResponse {
  return {
    success: true,
    message: "Plan created successfully",
    data: plan,
    leave_generation: { success: true, created_count: 52, skipped_count: 0 },
  }
}

function makeOkJson(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) } as unknown as Response
}

function makeErrorJson(status: number, message: string) {
  return { ok: false, status, json: () => Promise.resolve({ message }) } as unknown as Response
}

const BASE_URL = "https://ontrack-api.agilecyber.com/api/v1/driver-recurring-leave-plans"

// ─── listOffShifts ────────────────────────────────────────────────────────────

describe("listOffShifts", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls /list endpoint with defaults", async () => {
    const listResponse: OffShiftListResponse = {
      success: true,
      data: [makePlan()],
      pagination: { current_page: 1, per_page: 500, total: 1 },
    }
    mockFetch.mockResolvedValueOnce(makeOkJson(listResponse))

    const result = await listOffShifts()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/list"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer test-bearer-token" }) })
    )
    expect(result.data).toHaveLength(1)
    expect(result.data[0].work_days).toBe(5)
  })

  it("appends driver filter", async () => {
    mockFetch.mockResolvedValueOnce(makeOkJson({ success: true, data: [], pagination: { current_page: 1, per_page: 500, total: 0 } }))

    await listOffShifts({ driver: "driver-uuid-1" })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("driver=driver-uuid-1")
  })

  it("appends pagination params", async () => {
    mockFetch.mockResolvedValueOnce(makeOkJson({ success: true, data: [], pagination: { current_page: 2, per_page: 10, total: 0 } }))

    await listOffShifts({ page: 2, per_page: 10 })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("page=2")
    expect(url).toContain("per_page=10")
  })
})

// ─── createOffShift ───────────────────────────────────────────────────────────

describe("createOffShift", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("POSTs to /generate-leaves endpoint", async () => {
    const plan = makePlan()
    mockFetch.mockResolvedValueOnce(makeOkJson(makeCreateResponse(plan)))

    await createOffShift({
      driver_uuid:         "driver-uuid-1",
      work_days:           5,
      off_days:            2,
      first_leave_day:     "2025-01-04",
      plan_calendar_upto:  "2025-12-27",
    })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("/generate-leaves")
    expect(mockFetch.mock.calls[0][1].method).toBe("POST")
  })

  it("sends correct payload", async () => {
    mockFetch.mockResolvedValueOnce(makeOkJson(makeCreateResponse(makePlan())))

    await createOffShift({
      driver_uuid:         "driver-uuid-1",
      work_days:           4,
      off_days:            3,
      first_leave_day:     "2025-02-01",
      plan_calendar_upto:  "2025-11-30",
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.work_days).toBe(4)
    expect(body.off_days).toBe(3)
    expect(body.first_leave_day).toBe("2025-02-01")
  })

  it("returns leave_generation stats", async () => {
    mockFetch.mockResolvedValueOnce(makeOkJson(makeCreateResponse(makePlan())))

    const result = await createOffShift({
      driver_uuid:         "driver-uuid-1",
      work_days:           5,
      off_days:            2,
      first_leave_day:     "2025-01-04",
      plan_calendar_upto:  "2025-12-27",
    })

    expect(result.leave_generation.created_count).toBe(52)
    expect(result.data.driver_uuid).toBe("driver-uuid-1")
  })

  it("throws on API validation error", async () => {
    mockFetch.mockResolvedValueOnce(makeErrorJson(422, "work_days must be between 1 and 5"))

    await expect(
      createOffShift({ driver_uuid: "x", work_days: 10, off_days: 0, first_leave_day: "2025-01-01", plan_calendar_upto: "2025-12-31" })
    ).rejects.toThrow("work_days must be between 1 and 5")
  })
})

// ─── getOffShift ──────────────────────────────────────────────────────────────

describe("getOffShift", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("fetches plan by UUID and returns unwrapped data", async () => {
    const plan = makePlan()
    mockFetch.mockResolvedValueOnce(makeOkJson({ success: true, data: plan }))

    const result = await getOffShift("plan-uuid-1")

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toBe(`${BASE_URL}/plan-uuid-1`)
    expect(result.uuid).toBe("plan-uuid-1")
  })
})

// ─── updateOffShift ───────────────────────────────────────────────────────────

describe("updateOffShift", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("sends PUT with partial patch", async () => {
    const updated = makePlan({ off_days: 3 })
    mockFetch.mockResolvedValueOnce(makeOkJson(makeCreateResponse(updated)))

    const result = await updateOffShift("plan-uuid-1", { off_days: 3 })

    const options = mockFetch.mock.calls[0][1]
    expect(options.method).toBe("PUT")
    const body = JSON.parse(options.body as string)
    expect(body.off_days).toBe(3)
    expect(result.data.off_days).toBe(3)
  })

  it("returns regenerated leave_generation", async () => {
    const updated = makePlan({ plan_calendar_upto: "2026-12-31" })
    const response: OffShiftCreateResponse = {
      ...makeCreateResponse(updated),
      leave_generation: { success: true, created_count: 104, skipped_count: 0 },
    }
    mockFetch.mockResolvedValueOnce(makeOkJson(response))

    const result = await updateOffShift("plan-uuid-1", { plan_calendar_upto: "2026-12-31" })

    expect(result.leave_generation.created_count).toBe(104)
  })
})

// ─── deleteOffShift ───────────────────────────────────────────────────────────

describe("deleteOffShift", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("sends DELETE and returns success message", async () => {
    mockFetch.mockResolvedValueOnce(makeOkJson({ success: true, message: "Plan deleted and 52 leaves removed" }))

    const result = await deleteOffShift("plan-uuid-1")

    const options = mockFetch.mock.calls[0][1]
    expect(options.method).toBe("DELETE")
    expect(result.success).toBe(true)
    expect(result.message).toContain("52 leaves")
  })
})

// ─── Full lifecycle integration ───────────────────────────────────────────────

describe("Off-Shift full lifecycle", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("create → list → update → delete in sequence", async () => {
    const original = makePlan()

    // 1. Create
    mockFetch.mockResolvedValueOnce(makeOkJson(makeCreateResponse(original)))
    const created = await createOffShift({
      driver_uuid:         "driver-uuid-1",
      work_days:           5,
      off_days:            2,
      first_leave_day:     "2025-01-04",
      plan_calendar_upto:  "2025-12-27",
    })
    expect(created.success).toBe(true)
    expect(created.data.uuid).toBe("plan-uuid-1")

    // 2. List — contains the new plan
    mockFetch.mockResolvedValueOnce(makeOkJson({ success: true, data: [original], pagination: { current_page: 1, per_page: 500, total: 1 } }))
    const list = await listOffShifts({ driver: "driver-uuid-1" })
    expect(list.data).toHaveLength(1)

    // 3. Update off_days
    const changed = makePlan({ off_days: 3 })
    mockFetch.mockResolvedValueOnce(makeOkJson(makeCreateResponse(changed)))
    const updated = await updateOffShift("plan-uuid-1", { off_days: 3 })
    expect(updated.data.off_days).toBe(3)

    // 4. Delete
    mockFetch.mockResolvedValueOnce(makeOkJson({ success: true, message: "Deleted" }))
    const del = await deleteOffShift("plan-uuid-1")
    expect(del.success).toBe(true)

    // Total: 4 fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(4)
  })
})
