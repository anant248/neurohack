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
  /** True when camera permission was denied; metric bars hidden in ResultsCard */
  cameraUnavailable?: boolean
}

export interface LandmarkFrame {
  timestamp: number
  centered: boolean
  smiling: boolean
}

// ── Phase 5: Behavioral prep ──────────────────────────────────────────────────

export interface TailoredQuestion {
  text: string
  category: string
  starHint: string
}

export interface BehavioralPrepResponse {
  companyName: string
  role: string
  companyBlurb: string
  companyLink: string
  questions: TailoredQuestion[]
}

export interface PrepSession {
  id: string
  companyName: string
  role: string
  companyBlurb: string
  companyLink: string
  jdText: string
  questions: TailoredQuestion[]
  notes: string
  createdAt: Date
}

export interface BehavioralBankEntry {
  id: string
  title: string
  situation: string
  task: string
  action: string
  result: string
  tags: string[]
  createdAt: Date
}

// ── Coffee Chats ──────────────────────────────────────────────────────────────

export interface CoffeeChatQuestion {
  id: string
  text: string
  notes: string // TipTap HTML
}

export interface CoffeeChat {
  id: string
  personName: string
  company: string
  role: string
  date: string // "YYYY-MM-DD"
  format: "virtual" | "in-person"
  questions: CoffeeChatQuestion[]
  createdAt: Date
  updatedAt: Date
}
