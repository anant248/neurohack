import { describe, it, expect, vi, beforeEach } from "vitest"

const MOCK_QUESTION = {
  title: "Valid Parentheses",
  difficulty: "Easy" as const,
  content: "<p>Given a string.</p>",
  topicTags: ["Stack"],
  date: "2026-05-26",
}

vi.mock("@/lib/leetcode", () => ({
  fetchDailyQuestion: vi.fn().mockResolvedValue(MOCK_QUESTION),
}))

const { GET } = await import("@/app/api/leetcode/route")

describe("GET /api/leetcode", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 200 with question JSON", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe("Valid Parentheses")
    expect(json.difficulty).toBe("Easy")
  })

  it("includes Cache-Control header with s-maxage=3600", async () => {
    const res = await GET()
    const cacheHeader = res.headers.get("Cache-Control") ?? ""
    expect(cacheHeader).toContain("s-maxage=3600")
  })
})
