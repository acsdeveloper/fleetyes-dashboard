/**
 * Unit tests for auto-allocation-api.ts
 * Run with:  npx vitest run __tests__/auto-allocation-api.test.ts
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

// ─── Mock fetch ───────────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

vi.mock("@/lib/ontrack-api", () => ({
  getToken: () => "test-bearer-token",
}))

import {
  getShiftAssignmentData,
  initiateAsyncAllocation,
  applyAllocations,
  getConstraints,
  type ShiftAssignmentData,
  type ApplyAllocationsPayload,
} from "@/lib/auto-allocation-api"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeOkResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as unknown as Response
}

function makeErrorResponse(status: number, message: string) {
  return {
    ok: false,
    json: () => Promise.resolve({ message }),
  } as unknown as Response
}

const minimalShiftData: ShiftAssignmentData = {
  problem_type:             "shift_assignment",
  dates:                    ["2025-01-06"],
  dated_shifts:             [],
  resources:                [],
  vehicles_data:            [],
  previous_allocation_data: [],
  pre_assigned_shifts:      [],
  pre_assigned_vehicles:    [],
  company_uuid:             "company-uuid",
  fleet_uuid:               null,
  fleet_name:               null,
  constraints:              [],
}

// ─── getShiftAssignmentData ───────────────────────────────────────────────────

describe("getShiftAssignmentData", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls the correct endpoint with date params", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(minimalShiftData))

    await getShiftAssignmentData({ start_date: "2025-01-06", end_date: "2025-01-12" })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("shift-assignments/data"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-bearer-token" }),
      })
    )
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("start_date=2025-01-06")
    expect(url).toContain("end_date=2025-01-12")
  })

  it("returns ShiftAssignmentData on success", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(minimalShiftData))

    const result = await getShiftAssignmentData({ start_date: "2025-01-06", end_date: "2025-01-12" })

    expect(result.problem_type).toBe("shift_assignment")
    expect(result.company_uuid).toBe("company-uuid")
  })

  it("throws on API error with message", async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(422, "Invalid date range"))

    await expect(
      getShiftAssignmentData({ start_date: "2025-12-01", end_date: "2025-01-01" })
    ).rejects.toThrow("Invalid date range")
  })

  it("includes optional fleet_uuid when provided", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(minimalShiftData))

    await getShiftAssignmentData({ start_date: "2025-01-06", end_date: "2025-01-06", fleet_uuid: "fleet-123" })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("fleet_uuid=fleet-123")
  })
})

// ─── initiateAsyncAllocation ──────────────────────────────────────────────────

describe("initiateAsyncAllocation", () => {
  beforeEach(() => { vi.clearAllMocks() })

  const mockAllocPayload: ApplyAllocationsPayload = {
    company_uuid:        "company-uuid",
    allocated_resources: [],
    uuid:                "alloc-run-uuid",
    uncovered_shifts:    {},
  }

  it("POSTs to the allocation engine URL (not Ontrack)", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockAllocPayload))

    await initiateAsyncAllocation(minimalShiftData)

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("dev-resource-allocation.agilecyber.com")
    expect(url).toContain("/initiate-async-allocation")
  })

  it("sends Authorization header to the allocation engine", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockAllocPayload))

    await initiateAsyncAllocation(minimalShiftData)

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)["Authorization"]).toBe("Bearer test-bearer-token")
  })

  it("sends POST method with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockAllocPayload))

    await initiateAsyncAllocation(minimalShiftData)

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect(options.method).toBe("POST")
    expect(JSON.parse(options.body as string)).toMatchObject({ problem_type: "shift_assignment" })
  })

  it("returns ApplyAllocationsPayload on success", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockAllocPayload))

    const result = await initiateAsyncAllocation(minimalShiftData)

    expect(result.company_uuid).toBe("company-uuid")
    expect(result.uuid).toBe("alloc-run-uuid")
  })

  it("throws if engine returns error", async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, "Solver timeout"))

    await expect(initiateAsyncAllocation(minimalShiftData)).rejects.toThrow("Solver timeout")
  })
})

// ─── applyAllocations ─────────────────────────────────────────────────────────

describe("applyAllocations", () => {
  beforeEach(() => { vi.clearAllMocks() })

  const payload: ApplyAllocationsPayload = {
    company_uuid:        "company-uuid",
    allocated_resources: [
      {
        resource_id:        "driver-uuid",
        resource_name:      "John Driver",
        fleet_uuids:        [],
        fleet_trip_lengths: [],
        assignments:        { "shift-id": { id: "shift-id" } },
      },
    ],
  }

  it("POSTs to the Ontrack API URL", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({
      success: true, message: "Applied",
      data: { allocation_uuid: "x", updated_orders: 1, updated_order_ids: ["o1"], unassigned_orders: 0, unassigned_order_ids: [], skipped_assignments: 0, errors: [] },
    }))

    await applyAllocations(payload)

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("ontrack-api.agilecyber.com")
    expect(url).toContain("/shift-assignments/apply-allocations")
  })

  it("sends Authorization header", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({
      success: true, message: "Applied",
      data: { allocation_uuid: "x", updated_orders: 2, updated_order_ids: ["o1", "o2"], unassigned_orders: 0, unassigned_order_ids: [], skipped_assignments: 0, errors: [] },
    }))

    await applyAllocations(payload)

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)["Authorization"]).toBe("Bearer test-bearer-token")
  })

  it("returns updated_orders count", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({
      success: true, message: "Applied",
      data: { allocation_uuid: "x", updated_orders: 3, updated_order_ids: ["o1","o2","o3"], unassigned_orders: 1, unassigned_order_ids: ["o4"], skipped_assignments: 0, errors: [] },
    }))

    const result = await applyAllocations(payload)

    expect(result.data.updated_orders).toBe(3)
    expect(result.data.unassigned_orders).toBe(1)
  })
})

// ─── getConstraints ───────────────────────────────────────────────────────────

describe("getConstraints", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns constraints list", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({
      success: true,
      data: [{ type: "max_weekly_trips", is_active: true, is_default: 1 }],
    }))

    const result = await getConstraints()

    expect(result.data).toHaveLength(1)
    expect(result.data[0].type).toBe("max_weekly_trips")
  })

  it("appends only_active filter when provided", async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true, data: [] }))

    await getConstraints({ only_active: true })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("only_active=true")
  })
})
