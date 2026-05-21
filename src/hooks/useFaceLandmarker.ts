"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { FaceLandmarkerSession, FeedbackResult } from "@/lib/faceLandmarker"

export function useFaceLandmarker() {
  const [isReady, setIsReady] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
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

  const stop = useCallback(async (): Promise<FeedbackResult | undefined> => {
    if (!sessionRef.current) return undefined
    setIsRecording(false)
    setIsAnalyzing(true)
    const result = await sessionRef.current.stop()
    setResults(result)
    setIsAnalyzing(false)
    return result
  }, [])

  const reset = useCallback(() => {
    setResults(null)
  }, [])

  return { isReady, isRecording, isAnalyzing, results, start, stop, reset }
}
