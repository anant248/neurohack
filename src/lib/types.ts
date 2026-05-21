export interface SessionScore {
  attempt: number
  eyeContactScore: number
  expressionScore: number
  timestamp: Date
}

export interface FeedbackResult {
  eyeContactScore: number
  expressionScore: number
  feedback: string
}

export interface LandmarkFrame {
  timestamp: number
  centered: boolean
  smiling: boolean
}
