import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const mockGenerateContent = vi.fn()
const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }))

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({ getGenerativeModel: mockGetGenerativeModel })),
}))

vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key-abc")

const { POST } = await import("@/app/api/code-review/route")

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/code-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  code: "function twoSum(nums, target) { return []; }",
  language: "js",
  problemTitle: "Two Sum",
  problemContent: "<p>Return indices of two numbers.</p>",
}

describe("POST /api/code-review", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key-abc")
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "  **Correctness**: Incorrect — returns empty array.\n**Complexity**: O(1).\n**Style**: Use a hash map.  " },
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns 200 with trimmed review on valid input", async () => {
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty("review")
    expect(json.review).toContain("Correctness")
  })

  it("passes code and problem title to the model", async () => {
    await POST(makeRequest(VALID_BODY))
    expect(mockGenerateContent).toHaveBeenCalledOnce()
    const [[prompt]] = mockGenerateContent.mock.calls
    expect(prompt).toContain("Two Sum")
    expect(prompt).toContain("twoSum")
  })

  it("returns 400 for missing required fields", async () => {
    const res = await POST(makeRequest({ code: "x" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid language value", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, language: "ruby" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 for non-JSON body", async () => {
    const req = new NextRequest("http://localhost/api/code-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    expect((await POST(req)).status).toBe(400)
  })

  it("returns 503 when API key is absent", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "")
    vi.stubEnv("GEMINI_API_KEY", "")
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(503)
  })

  it("returns 500 when Gemini throws", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("timeout"))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(500)
  })
})
