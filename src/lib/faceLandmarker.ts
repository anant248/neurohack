import type { Category } from "@mediapipe/tasks-vision"
import {
  MEDIAPIPE_WASM_URL,
  MEDIAPIPE_MODEL_URL,
  EYE_TRACKING,
  SMILE_THRESHOLD,
  EYE_CONTACT_THRESHOLDS,
  EXPRESSION_THRESHOLDS,
} from "./constants"
import type { FeedbackResult, LandmarkFrame } from "./types"

export type { FeedbackResult, LandmarkFrame }

export interface FaceLandmarkerSession {
  readonly ready: Promise<void>
  start(videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement): Promise<void>
  stop(): Promise<FeedbackResult>
}

// Exported for unit testing
export function eyesAreCentered(categories: Category[]): boolean {
  const scores: Record<string, number> = {}
  categories.forEach(s => (scores[s.categoryName] = s.score))

  return (
    (scores.eyeLookDownLeft ?? 1) < EYE_TRACKING.upDownThreshold &&
    (scores.eyeLookDownRight ?? 1) < EYE_TRACKING.upDownThreshold &&
    (scores.eyeLookInLeft ?? 1) < EYE_TRACKING.leftRightThreshold &&
    (scores.eyeLookInRight ?? 1) < EYE_TRACKING.leftRightThreshold &&
    (scores.eyeLookOutLeft ?? 1) < EYE_TRACKING.leftRightThreshold &&
    (scores.eyeLookOutRight ?? 1) < EYE_TRACKING.leftRightThreshold &&
    (scores.eyeLookUpLeft ?? 1) < EYE_TRACKING.upDownThreshold &&
    (scores.eyeLookUpRight ?? 1) < EYE_TRACKING.upDownThreshold
  )
}

export function computeEyeContact(history: LandmarkFrame[]): number {
  if (history.length === 0) return 0
  const centered = history.filter(f => f.centered).length
  return Math.round((centered / history.length) * 100)
}

export function computeExpression(history: LandmarkFrame[]): number {
  if (history.length === 0) return 0
  const smiling = history.filter(f => f.smiling).length
  return Math.round((smiling / history.length) * 100)
}

export function generateFeedback(eyeScore: number, smileScore: number): string {
  let feedback = ""

  if (eyeScore < EYE_CONTACT_THRESHOLDS.low) {
    feedback += "Try to maintain more consistent eye contact with the camera. "
  } else if (eyeScore < EYE_CONTACT_THRESHOLDS.medium) {
    feedback += "Your eye contact was decent, but keeping focus slightly more on the camera will help. "
  } else {
    feedback += "Great eye contact — very engaging! "
  }

  if (smileScore < EXPRESSION_THRESHOLDS.low) {
    feedback += "Consider smiling a bit more to appear warmer and more confident. "
  } else if (smileScore < EXPRESSION_THRESHOLDS.medium) {
    feedback += "Good expression — adding occasional smiles can improve rapport. "
  } else {
    feedback += "Excellent expression and positivity! "
  }

  return feedback.trim()
}

export function createFaceLandmarkerSession(): FaceLandmarkerSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let faceLandmarker: any = null
  let videoEl: HTMLVideoElement | null = null
  let canvasEl: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let webcamStream: MediaStream | null = null
  let tracking = false
  let landmarkHistory: LandmarkFrame[] = []

  const ready = (async () => {
    const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision")
    const resolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL)
    faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
      baseOptions: {
        modelAssetPath: MEDIAPIPE_MODEL_URL,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    })
  })()

  function predictLoop(): void {
    if (!tracking || !faceLandmarker || !videoEl || !canvasEl || !ctx) return

    const nowMs = performance.now()
    const result = faceLandmarker.detectForVideo(videoEl, nowMs)

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

    if (result.faceLandmarks && result.faceBlendshapes?.[0]) {
      const categories: Category[] = result.faceBlendshapes[0].categories

      const centered = eyesAreCentered(categories)
      const leftSmile = categories.find(c => c.categoryName === "mouthSmileLeft")?.score ?? 0
      const rightSmile = categories.find(c => c.categoryName === "mouthSmileRight")?.score ?? 0
      const smiling = leftSmile + rightSmile > SMILE_THRESHOLD

      landmarkHistory.push({ timestamp: nowMs, centered, smiling })
    }

    requestAnimationFrame(predictLoop)
  }

  return {
    ready,

    async start(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<void> {
      await ready
      videoEl = video
      canvasEl = canvas
      ctx = canvas.getContext("2d")
      landmarkHistory = []
      tracking = true

      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoEl.srcObject = webcamStream

      await new Promise<void>(resolve => {
        videoEl!.onloadeddata = () => {
          canvasEl!.width = videoEl!.videoWidth
          canvasEl!.height = videoEl!.videoHeight
          resolve()
        }
      })

      requestAnimationFrame(predictLoop)
    },

    async stop(): Promise<FeedbackResult> {
      tracking = false

      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop())
        webcamStream = null
      }

      const eyeContactScore = computeEyeContact(landmarkHistory)
      const expressionScore = computeExpression(landmarkHistory)
      const feedback = generateFeedback(eyeContactScore, expressionScore)

      return { eyeContactScore, expressionScore, feedback }
    },
  }
}
