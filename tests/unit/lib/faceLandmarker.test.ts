import { describe, it, expect } from "vitest"
import {
  eyesAreCentered,
  computeEyeContact,
  computeExpression,
  generateFeedback,
} from "@/lib/faceLandmarker"
import type { LandmarkFrame } from "@/lib/types"

// Helper to build a minimal Category array
function makeCategories(overrides: Record<string, number> = {}) {
  const defaults: Record<string, number> = {
    eyeLookDownLeft: 0.1,
    eyeLookDownRight: 0.1,
    eyeLookInLeft: 0.1,
    eyeLookInRight: 0.1,
    eyeLookOutLeft: 0.1,
    eyeLookOutRight: 0.1,
    eyeLookUpLeft: 0.1,
    eyeLookUpRight: 0.1,
  }
  const merged = { ...defaults, ...overrides }
  return Object.entries(merged).map(([categoryName, score]) => ({ categoryName, score, index: 0, displayName: "" }))
}

describe("eyesAreCentered", () => {
  it("returns true when all gaze scores are within thresholds", () => {
    expect(eyesAreCentered(makeCategories())).toBe(true)
  })

  it("returns false when looking down", () => {
    expect(eyesAreCentered(makeCategories({ eyeLookDownLeft: 0.7 }))).toBe(false)
  })

  it("returns false when looking right (out)", () => {
    expect(eyesAreCentered(makeCategories({ eyeLookOutRight: 0.5 }))).toBe(false)
  })

  it("returns false when looking up", () => {
    expect(eyesAreCentered(makeCategories({ eyeLookUpLeft: 0.65 }))).toBe(false)
  })
})

describe("computeEyeContact", () => {
  it("returns 0 for empty history", () => {
    expect(computeEyeContact([])).toBe(0)
  })

  it("returns 100 when all frames are centered", () => {
    const history: LandmarkFrame[] = [
      { timestamp: 1, centered: true, smiling: false },
      { timestamp: 2, centered: true, smiling: false },
    ]
    expect(computeEyeContact(history)).toBe(100)
  })

  it("returns 50 for half centered frames", () => {
    const history: LandmarkFrame[] = [
      { timestamp: 1, centered: true, smiling: false },
      { timestamp: 2, centered: false, smiling: false },
    ]
    expect(computeEyeContact(history)).toBe(50)
  })

  it("rounds to nearest integer", () => {
    const history: LandmarkFrame[] = Array.from({ length: 3 }, (_, i) => ({
      timestamp: i,
      centered: i < 2,
      smiling: false,
    }))
    expect(computeEyeContact(history)).toBe(67) // 2/3 = 66.67 → 67
  })
})

describe("computeExpression", () => {
  it("returns 0 for empty history", () => {
    expect(computeExpression([])).toBe(0)
  })

  it("returns 100 when all frames are smiling", () => {
    const history: LandmarkFrame[] = [
      { timestamp: 1, centered: false, smiling: true },
      { timestamp: 2, centered: false, smiling: true },
    ]
    expect(computeExpression(history)).toBe(100)
  })

  it("returns 0 when no frames are smiling", () => {
    const history: LandmarkFrame[] = [{ timestamp: 1, centered: true, smiling: false }]
    expect(computeExpression(history)).toBe(0)
  })
})

describe("generateFeedback", () => {
  it("gives low eye contact message when score < 40", () => {
    const feedback = generateFeedback(20, 60)
    expect(feedback).toContain("consistent eye contact")
  })

  it("gives medium eye contact message when score 40-69", () => {
    const feedback = generateFeedback(55, 60)
    expect(feedback).toContain("decent")
  })

  it("gives high eye contact message when score >= 70", () => {
    const feedback = generateFeedback(80, 60)
    expect(feedback).toContain("Great eye contact")
  })

  it("gives low expression message when smile score < 20", () => {
    const feedback = generateFeedback(75, 10)
    expect(feedback).toContain("smiling")
  })

  it("gives high expression message when smile score >= 50", () => {
    const feedback = generateFeedback(75, 60)
    expect(feedback).toContain("Excellent expression")
  })

  it("trims trailing whitespace", () => {
    const feedback = generateFeedback(80, 60)
    expect(feedback).toBe(feedback.trim())
  })
})
