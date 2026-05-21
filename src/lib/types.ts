export interface SessionScore {
  attempt: number
  eyeContactScore: number
  expressionScore: number
  timestamp: Date
}

export interface FeedbackResult {
  eyeContactScore: number
  expressionScore: number
  /** Rule-based fallback feedback (always present, computed locally) */
  feedback: string
  /** Gemini-generated coaching feedback (set async after API call) */
  aiFeedback?: string
}

export interface LandmarkFrame {
  timestamp: number
  centered: boolean
  smiling: boolean
}
