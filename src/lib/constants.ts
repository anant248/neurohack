export const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"

export const MEDIAPIPE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

export const EYE_TRACKING = {
  upDownThreshold: 0.6,
  leftRightThreshold: 0.4,
} as const

export const SMILE_THRESHOLD = 0.2

export const EYE_CONTACT_THRESHOLDS = {
  low: 40,
  medium: 70,
} as const

export const EXPRESSION_THRESHOLDS = {
  low: 20,
  medium: 50,
} as const

export const INTERVIEW_QUESTIONS: readonly string[] = [
  "Tell me about yourself.",
  "What is your greatest strength?",
  "What is your greatest weakness?",
  "Describe a challenge you overcame.",
  "Why are you interested in this position?",
  "Tell me about a time you worked in a team.",
  "How do you handle stress?",
  "Describe a conflict and how you resolved it.",
] as const
