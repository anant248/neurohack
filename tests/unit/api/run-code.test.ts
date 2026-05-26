import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

// Mock fetch — used only for Python (Piston). JS runs via vm, never calls fetch.
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

const { POST } = await import("@/app/api/run-code/route")

const BASE_META = JSON.stringify({
  name: "twoSum",
  params: [{ name: "nums", type: "integer[]" }, { name: "target", type: "integer" }],
  return: { type: "integer[]" },
})
const BASE_CONTENT = "<pre>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]</pre>"
const BASE_TESTCASES = "[2,7,11,15]\n9"

// JS body — executed via vm (no fetch)
const JS_BODY = {
  code: "var twoSum = function(nums, target) { return [0, 1]; };",
  language: "js",
  exampleTestcases: BASE_TESTCASES,
  metaData: BASE_META,
  content: BASE_CONTENT,
}

// Python body — executed via Piston (uses fetch mock)
const PY_BODY = {
  ...JS_BODY,
  code: "def twoSum(nums, target):\n    return [0, 1]",
  language: "py",
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function mockPiston(stdout: string, stderr = "") {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ run: { stdout, stderr, code: 0 } }),
  })
}

describe("POST /api/run-code", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.clearAllMocks())

  // ── JavaScript (vm-based, no fetch) ──────────────────────────────────────

  it("JS: returns 200 with correct pass/fail results", async () => {
    const res = await POST(makeRequest(JS_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results).toHaveLength(1)
    expect(json.results[0].pass).toBe(true)
  })

  it("JS: captures a runtime error in the result (not a 500)", async () => {
    const body = { ...JS_BODY, code: "var twoSum = function() { throw new Error('boom'); };" }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results[0].pass).toBe(false)
    expect(json.results[0].actual).toContain("boom")
  })

  // ── Python (Piston-based, uses fetch mock) ────────────────────────────────

  it("Python: returns 200 with results from Piston stdout", async () => {
    mockPiston(JSON.stringify([{ pass: true, actual: "[0, 1]", expected: "[0, 1]" }]))
    const res = await POST(makeRequest(PY_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results[0].pass).toBe(true)
  })

  it("Python: surfaces stderr as a fail result when stdout is empty", async () => {
    mockPiston("", "SyntaxError: invalid syntax")
    const res = await POST(makeRequest(PY_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results[0].pass).toBe(false)
    expect(json.results[0].actual).toContain("SyntaxError")
  })

  it("Python: returns 503 with helpful message when Piston is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"))
    const res = await POST(makeRequest(PY_BODY))
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.error).toContain("Python execution service")
  })

  it("Python: returns 503 when Piston returns non-OK status", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const res = await POST(makeRequest(PY_BODY))
    expect(res.status).toBe(503)
  })

  // ── Shared validation ─────────────────────────────────────────────────────

  it("returns 400 for missing required fields", async () => {
    expect((await POST(makeRequest({ code: "x" }))).status).toBe(400)
  })

  it("returns 400 for non-JSON body", async () => {
    const req = new NextRequest("http://localhost/api/run-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    expect((await POST(req)).status).toBe(400)
  })

  it("returns 422 when test cases cannot be parsed", async () => {
    const body = { ...JS_BODY, exampleTestcases: "", content: "<p>no outputs here</p>" }
    expect((await POST(makeRequest(body))).status).toBe(422)
  })
})
