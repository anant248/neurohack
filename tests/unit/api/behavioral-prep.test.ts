import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// ---- Mock @google/generative-ai before importing route ----
const mockGenerateContent = vi.fn()
const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }))

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({ getGenerativeModel: mockGetGenerativeModel })),
}))

vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key-abc")

const { POST } = await import("@/app/api/behavioral-prep/route")

const VALID_RESPONSE = {
  companyName: "Acme Corp",
  role: "Software Engineer",
  companyBlurb: "Acme Corp builds developer tools. Founded in 2010, they have 500 employees.",
  companyLink: "https://acme.com",
  questions: [
    { text: "Tell me about a time you led a project.", category: "Leadership", starHint: "Describe the team size (S/T), your approach (A), and outcome (R)." },
    { text: "Describe a conflict with a teammate.", category: "Conflict", starHint: "Set the context (S/T), your actions (A), and resolution (R)." },
  ],
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/behavioral-prep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/behavioral-prep", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key-abc")
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(VALID_RESPONSE) },
    })
  })

  it("returns 200 with company info and questions on valid input", async () => {
    const req = makeRequest({
      resumeText: "Software engineer with 3 years of experience in TypeScript.",
      jobDescriptionText: "Acme Corp is hiring a Software Engineer to build developer tools.",
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.companyName).toBe("Acme Corp")
    expect(json.role).toBe("Software Engineer")
    expect(json.companyBlurb).toBeTruthy()
    expect(json.companyLink).toMatch(/^https?:\/\//)
    expect(Array.isArray(json.questions)).toBe(true)
    expect(json.questions.length).toBeGreaterThan(0)
  })

  it("returns 400 for missing resumeText", async () => {
    const req = makeRequest({ jobDescriptionText: "Some JD" })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty("error")
  })

  it("returns 400 for missing jobDescriptionText", async () => {
    const req = makeRequest({ resumeText: "My resume" })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 for non-JSON body", async () => {
    const req = new NextRequest("http://localhost/api/behavioral-prep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 503 when API key is absent", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "")
    vi.stubEnv("GEMINI_API_KEY", "")
    const req = makeRequest({ resumeText: "My resume", jobDescriptionText: "JD" })
    const res = await POST(req)
    expect(res.status).toBe(503)
  })

  it("returns 500 when Gemini returns invalid JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "not valid json {{{" },
    })
    const req = makeRequest({ resumeText: "My resume", jobDescriptionText: "JD" })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it("returns 500 when Gemini omits required fields", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify({ companyName: "", questions: [] }) },
    })
    const req = makeRequest({ resumeText: "My resume", jobDescriptionText: "JD" })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it("returns 500 when the Gemini call throws", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("network failure"))
    const req = makeRequest({ resumeText: "My resume", jobDescriptionText: "JD" })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it("each question has text, category, and starHint", async () => {
    const req = makeRequest({ resumeText: "My resume", jobDescriptionText: "JD" })
    const res = await POST(req)
    const json = await res.json()
    for (const q of json.questions) {
      expect(q).toHaveProperty("text")
      expect(q).toHaveProperty("category")
      expect(q).toHaveProperty("starHint")
    }
  })
})
