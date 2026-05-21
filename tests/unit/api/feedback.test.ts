import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// ---- Mock @google/generative-ai before importing route ----
const mockGenerateContent = vi.fn()
const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }))

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({ getGenerativeModel: mockGetGenerativeModel })),
}))

// ---- Stub env vars ----
vi.stubEnv("GEMINI_API_KEY", "test-key-abc")

// ---- Import route after mocks are set up ----
const { POST } = await import("@/app/api/feedback/route")

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv("GEMINI_API_KEY", "test-key-abc")
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "  Great eye contact and warm expression!  " },
    })
  })

  it("returns 200 with trimmed AI feedback on valid input", async () => {
    const req = makeRequest({
      eyeContactScore: 75,
      expressionScore: 60,
      question: "Tell me about yourself.",
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ feedback: "Great eye contact and warm expression!" })
  })

  it("passes previousScores through to the model", async () => {
    const req = makeRequest({
      eyeContactScore: 80,
      expressionScore: 70,
      question: "Describe a challenge.",
      previousScores: [{ eyeContactScore: 60, expressionScore: 50 }],
    })
    await POST(req)
    expect(mockGenerateContent).toHaveBeenCalledOnce()
    const [[prompt]] = mockGenerateContent.mock.calls
    expect(typeof prompt).toBe("string")
    expect(prompt).toContain("Describe a challenge.")
    expect(prompt).toContain("Progress since last attempt")
  })

  it("returns 400 for missing required fields", async () => {
    const req = makeRequest({ eyeContactScore: 75 }) // missing expressionScore & question
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty("error")
  })

  it("returns 400 for scores out of range", async () => {
    const req = makeRequest({ eyeContactScore: 150, expressionScore: -5, question: "Q" })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for non-JSON body", async () => {
    const req = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 503 when GEMINI_API_KEY is absent", async () => {
    vi.stubEnv("GEMINI_API_KEY", "")
    const req = makeRequest({ eyeContactScore: 75, expressionScore: 60, question: "Q" })
    const res = await POST(req)
    expect(res.status).toBe(503)
  })

  it("returns 500 when the Gemini call throws", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("network failure"))
    const req = makeRequest({ eyeContactScore: 75, expressionScore: 60, question: "Q" })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
