import { describe, it, expect } from "vitest"
import { buildCodeReviewPrompt } from "@/lib/codeReviewPrompt"

const base = {
  code: "function twoSum(nums, target) { return []; }",
  language: "js" as const,
  problemTitle: "Two Sum",
  problemContent: "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices.</p>",
}

describe("buildCodeReviewPrompt", () => {
  it("includes the problem title", () => {
    expect(buildCodeReviewPrompt(base)).toContain("Two Sum")
  })

  it("includes the candidate code", () => {
    expect(buildCodeReviewPrompt(base)).toContain("function twoSum")
  })

  it("strips HTML tags from problem content", () => {
    const prompt = buildCodeReviewPrompt(base)
    expect(prompt).not.toContain("<p>")
    expect(prompt).not.toContain("<code>")
    expect(prompt).toContain("integers")
  })

  it("labels the language correctly for JavaScript", () => {
    expect(buildCodeReviewPrompt(base)).toContain("JavaScript")
  })

  it("labels the language correctly for Python", () => {
    const prompt = buildCodeReviewPrompt({ ...base, language: "py" })
    expect(prompt).toContain("Python")
    expect(prompt).not.toContain("JavaScript")
  })

  it("asks for Correctness, Complexity, and Style sections", () => {
    const prompt = buildCodeReviewPrompt(base)
    expect(prompt).toContain("Correctness")
    expect(prompt).toContain("Complexity")
    expect(prompt).toContain("Style")
  })

  it("returns a non-empty string for any valid input", () => {
    expect(buildCodeReviewPrompt(base).length).toBeGreaterThan(100)
  })
})
