import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

// Mock fetch (Piston API call)
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

const { POST } = await import("@/app/api/run-code/route")

const VALID_BODY = {
  code: "var twoSum = function(nums, target) { return [0, 1]; };",
  language: "js",
  exampleTestcases: "[2,7,11,15]\n9",
  metaData: JSON.stringify({
    name: "twoSum",
    params: [{ name: "nums", type: "integer[]" }, { name: "target", type: "integer" }],
    return: { type: "integer[]" },
  }),
  content: "<pre>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]</pre>",
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function mockPiston(stdout: string, stderr = "", code = 0) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ run: { stdout, stderr, code } }),
  })
}

describe("POST /api/run-code", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.clearAllMocks())

  it("returns 200 with pass/fail results on success", async () => {
    mockPiston(JSON.stringify([{ pass: true, actual: "[0,1]", expected: "[0,1]" }]))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results).toHaveLength(1)
    expect(json.results[0].pass).toBe(true)
  })

  it("returns 400 for missing required fields", async () => {
    const res = await POST(makeRequest({ code: "x" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 for non-JSON body", async () => {
    const req = new NextRequest("http://localhost/api/run-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    expect((await POST(req)).status).toBe(400)
  })

  it("returns runtime error results when stdout is empty", async () => {
    mockPiston("", "SyntaxError: Unexpected token")
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results[0].pass).toBe(false)
    expect(json.results[0].actual).toContain("SyntaxError")
  })

  it("returns 503 when Piston is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(Object.assign(new Error("timeout"), { name: "TimeoutError" }))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.error).toContain("timed out")
  })

  it("returns 503 when Piston returns non-OK", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(503)
  })

  it("returns 422 when test cases cannot be parsed (empty exampleTestcases)", async () => {
    const body = { ...VALID_BODY, exampleTestcases: "", content: "<p>no outputs here</p>" }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(422)
  })
})
