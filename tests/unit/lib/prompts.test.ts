import { describe, it, expect } from "vitest"
import { buildFeedbackPrompt } from "@/lib/prompts"

describe("buildFeedbackPrompt", () => {
  const base = {
    eyeContactScore: 75,
    expressionScore: 60,
    question: "Tell me about yourself.",
  }

  it("includes the eye contact score", () => {
    const prompt = buildFeedbackPrompt(base)
    expect(prompt).toContain("75%")
  })

  it("includes the expression score", () => {
    const prompt = buildFeedbackPrompt(base)
    expect(prompt).toContain("60%")
  })

  it("does NOT embed the question text in the prompt (prevents verbal-content inference)", () => {
    const prompt = buildFeedbackPrompt(base)
    expect(prompt).not.toContain("Tell me about yourself.")
  })

  it("omits progress context when previousScores is not provided", () => {
    const prompt = buildFeedbackPrompt(base)
    expect(prompt).not.toContain("Progress since last attempt")
  })

  it("omits progress context when previousScores is an empty array", () => {
    const prompt = buildFeedbackPrompt({ ...base, previousScores: [] })
    expect(prompt).not.toContain("Progress since last attempt")
  })

  it("includes progress context when previousScores is provided", () => {
    const prompt = buildFeedbackPrompt({
      ...base,
      previousScores: [{ eyeContactScore: 55, expressionScore: 40 }],
    })
    expect(prompt).toContain("Progress since last attempt")
  })

  it("shows positive delta with + sign", () => {
    const prompt = buildFeedbackPrompt({
      eyeContactScore: 80,
      expressionScore: 65,
      question: "Q",
      previousScores: [{ eyeContactScore: 60, expressionScore: 50 }],
    })
    expect(prompt).toContain("+20%")
    expect(prompt).toContain("+15%")
  })

  it("shows negative delta without + sign", () => {
    const prompt = buildFeedbackPrompt({
      eyeContactScore: 40,
      expressionScore: 30,
      question: "Q",
      previousScores: [{ eyeContactScore: 70, expressionScore: 60 }],
    })
    expect(prompt).toContain("-30%")
  })

  it("instructs to lead with strength when either score >= 60", () => {
    const prompt = buildFeedbackPrompt({ eyeContactScore: 75, expressionScore: 30, question: "Q" })
    expect(prompt).toContain("Start with a genuine strength")
  })

  it("instructs to be encouraging when both scores < 60", () => {
    const prompt = buildFeedbackPrompt({ eyeContactScore: 40, expressionScore: 30, question: "Q" })
    expect(prompt).toContain("Be encouraging")
  })

  it("returns a non-empty string for any valid input", () => {
    const prompt = buildFeedbackPrompt({ eyeContactScore: 0, expressionScore: 0, question: "x" })
    expect(prompt.length).toBeGreaterThan(50)
  })
})
