/**
 * Unit tests for issues-api.ts
 * Matches the actual API: report field, IssueStatus = "pending"|"in-progress"|"resolved"|"closed"
 * Run with:  npx vitest run __tests__/issues-api.test.ts
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

// ─── Mock ontrack-api ─────────────────────────────────────────────────────────
// IMPORTANT: vi.mock is hoisted - do NOT reference outer variables in the factory.
// Access the mock fn via vi.mocked() after import.
vi.mock("@/lib/ontrack-api", () => ({
  ontrackFetch:     vi.fn(),
  buildQueryString: vi.fn((params: Record<string, unknown>) => {
    const entries = Object.entries(params).filter(([, v]) => v != null && v !== "")
    return entries.length ? "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&") : ""
  }),
  getToken: () => "test-token",
}))

import { ontrackFetch } from "@/lib/ontrack-api"
import {
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  updateIssueStatus,
  assignIssue,
  deleteIssue,
  bulkDeleteIssues,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/issues-api"

const mockOntrackFetch = vi.mocked(ontrackFetch)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    uuid:       "issue-uuid-1",
    public_id:  "ISS-001",
    status:     "pending",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    report:     "Brake fault detected",
    priority:   "medium",
    ...overrides,
  }
}

// ─── listIssues ───────────────────────────────────────────────────────────────

describe("listIssues", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns issues and meta on success", async () => {
    const issues = [makeIssue(), makeIssue({ uuid: "issue-uuid-2" })]
    mockOntrackFetch.mockResolvedValueOnce({
      issues,
      meta: { total: 2, per_page: 50, current_page: 1, last_page: 1 },
    })

    const result = await listIssues()

    expect(result.issues).toHaveLength(2)
    expect(result.issues[0].report).toBe("Brake fault detected")
  })

  it("passes query filter in URL", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issues: [], meta: { total: 0, per_page: 50, current_page: 1, last_page: 1 } })

    await listIssues({ query: "brake" })

    expect(mockOntrackFetch).toHaveBeenCalledWith(expect.stringContaining("query=brake"))
  })

  it("passes priority filter", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issues: [], meta: { total: 0, per_page: 50, current_page: 1, last_page: 1 } })

    await listIssues({ priority: "high" as IssuePriority })

    expect(mockOntrackFetch).toHaveBeenCalledWith(expect.stringContaining("priority=high"))
  })

  it("passes status filter (in-progress using hyphen)", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issues: [], meta: { total: 0, per_page: 50, current_page: 1, last_page: 1 } })

    await listIssues({ status: "in-progress" as IssueStatus })

    expect(mockOntrackFetch).toHaveBeenCalledWith(expect.stringContaining("status=in-progress"))
  })

  it("throws on API error", async () => {
    mockOntrackFetch.mockRejectedValueOnce(new Error("Network error"))

    await expect(listIssues()).rejects.toThrow("Network error")
  })
})

// ─── getIssue ─────────────────────────────────────────────────────────────────

describe("getIssue", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("returns the unwrapped issue from { issue: ... } response", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue() })

    const result = await getIssue("issue-uuid-1")

    expect(result.uuid).toBe("issue-uuid-1")
    expect(result.status).toBe("pending")
  })

  it("calls /issues/<id>", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue() })

    await getIssue("my-uuid")

    expect(mockOntrackFetch).toHaveBeenCalledWith("/issues/my-uuid")
  })
})

// ─── createIssue ──────────────────────────────────────────────────────────────

describe("createIssue", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("sends POST to /issues with body wrapped in { issue: ... }", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue({ report: "Oil leak" }) })

    await createIssue({ report: "Oil leak", priority: "high" })

    expect(mockOntrackFetch).toHaveBeenCalledWith("/issues", expect.objectContaining({ method: "POST" }))
    const body = JSON.parse((mockOntrackFetch.mock.calls[0][1] as { body: string }).body)
    expect(body.issue.report).toBe("Oil leak")
  })

  it("returns the unwrapped Issue from { issue: ... }", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue({ priority: "high" }) })

    const result = await createIssue({ report: "Oil leak", priority: "high" })

    expect(result.priority).toBe("high")
  })
})

// ─── updateIssue ──────────────────────────────────────────────────────────────

describe("updateIssue", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("sends PUT to /issues/<id>", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue({ status: "in-progress" }) })

    const result = await updateIssue("issue-uuid-1", { status: "in-progress" })

    expect(mockOntrackFetch).toHaveBeenCalledWith("/issues/issue-uuid-1", expect.objectContaining({ method: "PUT" }))
    expect(result.status).toBe("in-progress")
  })

  it("wraps patch in { issue: ... }", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue() })

    await updateIssue("id", { priority: "critical" })

    const body = JSON.parse((mockOntrackFetch.mock.calls[0][1] as { body: string }).body)
    expect(body.issue.priority).toBe("critical")
  })
})

// ─── updateIssueStatus ────────────────────────────────────────────────────────

describe("updateIssueStatus", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("delegates to updateIssue with status field only", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue({ status: "resolved" }) })

    const result = await updateIssueStatus("issue-uuid-1", "resolved")

    expect(result.status).toBe("resolved")
    expect(mockOntrackFetch).toHaveBeenCalledWith("/issues/issue-uuid-1", expect.objectContaining({ method: "PUT" }))
  })
})

// ─── assignIssue ─────────────────────────────────────────────────────────────

describe("assignIssue", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("sets assigned_to_uuid via updateIssue", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue({ assignee_name: "Adam" }) })

    const result = await assignIssue("issue-uuid-1", "user-uuid-1")

    const body = JSON.parse((mockOntrackFetch.mock.calls[0][1] as { body: string }).body)
    expect(body.issue.assigned_to_uuid).toBe("user-uuid-1")
    expect(result.assignee_name).toBe("Adam")
  })
})

// ─── deleteIssue ──────────────────────────────────────────────────────────────

describe("deleteIssue", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("calls DELETE /issues/<id> and returns Issue", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ issue: makeIssue() })

    const result = await deleteIssue("issue-uuid-1")

    expect(mockOntrackFetch).toHaveBeenCalledWith("/issues/issue-uuid-1", { method: "DELETE" })
    expect(result.uuid).toBe("issue-uuid-1")
  })
})

// ─── bulkDeleteIssues ────────────────────────────────────────────────────────

describe("bulkDeleteIssues", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("sends DELETE to /issues/bulk-delete with ids array", async () => {
    mockOntrackFetch.mockResolvedValueOnce({ deleted: 3 })

    const result = await bulkDeleteIssues(["uuid-1", "uuid-2", "uuid-3"])

    expect(mockOntrackFetch).toHaveBeenCalledWith("/issues/bulk-delete", expect.objectContaining({ method: "DELETE" }))
    const body = JSON.parse((mockOntrackFetch.mock.calls[0][1] as { body: string }).body)
    expect(body.ids).toEqual(["uuid-1", "uuid-2", "uuid-3"])
    expect(result.deleted).toBe(3)
  })
})
