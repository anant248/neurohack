import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchDailyQuestion } from "@/lib/leetcode"

const MOCK_RESPONSE = {
  data: {
    activeDailyCodingChallengeQuestion: {
      date: "2026-05-26",
      question: {
        title: "Valid Parentheses",
        difficulty: "Easy",
        content: "<p>Given a string <code>s</code>, determine if it is valid.</p>",
        topicTags: [{ name: "Stack" }, { name: "String" }],
      },
    },
  },
}

describe("fetchDailyQuestion", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_RESPONSE,
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("maps the LeetCode GraphQL response to LeetCodeQuestion shape", async () => {
    const q = await fetchDailyQuestion()
    expect(q.title).toBe("Valid Parentheses")
    expect(q.difficulty).toBe("Easy")
    expect(q.topicTags).toEqual(["Stack", "String"])
    expect(q.date).toBe("2026-05-26")
    expect(q.content).toContain("valid")
  })

  it("falls back to a hardcoded question when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")))
    const q = await fetchDailyQuestion()
    expect(q.title).toBeTruthy()
    expect(["Easy", "Medium", "Hard"]).toContain(q.difficulty)
    expect(Array.isArray(q.topicTags)).toBe(true)
  })

  it("falls back when the API returns a non-OK status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    )
    const q = await fetchDailyQuestion()
    expect(q.title).toBeTruthy()
  })

  it("falls back when the response has no challenge data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: {} }) }),
    )
    const q = await fetchDailyQuestion()
    expect(q.title).toBeTruthy()
  })
})
