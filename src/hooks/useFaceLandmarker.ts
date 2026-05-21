"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { FaceLandmarkerSession } from "@/lib/faceLandmarker"
import type { FeedbackResult, SessionScore } from "@/lib/types"

export function useFaceLandmarker() {
  const [isReady, setIsReady] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [results, setResults] = useState<FeedbackResult | null>(null)
  const sessionRef = useRef<FaceLandmarkerSession | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { createFaceLandmarkerSession } = await import("@/lib/faceLandmarker")
      const session = createFaceLandmarkerSession()
      sessionRef.current = session
      await session.ready
      if (!cancelled) setIsReady(true)
    }

    init().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [])

  const start = useCallback(
    async (videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement) => {
      if (!sessionRef.current || !isReady) return
      setResults(null)
      setIsRecording(true)
      await sessionRef.current.start(videoEl, canvasEl)
    },
    [isReady],
  )

  const stop = useCallback(
    async (question: string, previousScores?: SessionScore[]): Promise<FeedbackResult | undefined> => {
      if (!sessionRef.current) return undefined
      setIsRecording(false)
      setIsAnalyzing(true)
      const result = await sessionRef.current.stop()
      setResults(result)
      setIsAnalyzing(false)

      // Fetch AI coaching feedback asynchronously; fallback stays in result.feedback
      setIsAiLoading(true)
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eyeContactScore: result.eyeContactScore,
            expressionScore: result.expressionScore,
            question,
            previousScores: previousScores?.map(s => ({
              eyeContactScore: s.eyeContactScore,
              expressionScore: s.expressionScore,
            })),
          }),
        })
        if (res.ok) {
          const { feedback: aiFeedback } = (await res.json()) as { feedback: string }
          setResults(prev => (prev ? { ...prev, aiFeedback } : prev))
        }
      } catch (err) {
        console.error("[useFaceLandmarker] AI feedback request failed:", err)
      } finally {
        setIsAiLoading(false)
      }

      return result
    },
    [],
  )

  const reset = useCallback(() => {
    setResults(null)
  }, [])

  return { isReady, isRecording, isAnalyzing, isAiLoading, results, start, stop, reset }
}
