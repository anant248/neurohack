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

  it("embeds the question for STAR coaching context but explicitly prohibits verbal inference", () => {
    // Phase 5 intentional change: question IS included to provide STAR framework tips
    // specific to the question type. The prompt must explicitly prohibit Gemini from
    // evaluating what the candidate said (no audio is available).
    const prompt = buildFeedbackPrompt(base)
    expect(prompt).toContain("Tell me about yourself.")
    // Must tell Gemini it cannot hear the candidate
    expect(prompt.toLowerCase()).toMatch(/no audio|cannot hear|have no audio/)
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

  it("includes three structured section headings", () => {
    const prompt = buildFeedbackPrompt(base)
    expect(prompt).toContain("**Visual Presence:**")
    expect(prompt).toContain("**STAR Tip:**")
    expect(prompt).toContain("**Key Focus:**")
  })
})
