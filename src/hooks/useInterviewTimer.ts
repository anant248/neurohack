"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export interface InterviewTimerState {
  timeLeft: number | null
  isWarning: boolean
  isExpired: boolean
  startTimer: () => void
  resetTimer: () => void
}

export function useInterviewTimer(durationSeconds = 120): InterviewTimerState {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTick = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => () => clearTick(), [])

  const startTimer = useCallback(() => {
    clearTick()
    setTimeLeft(durationSeconds)

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearTick()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [durationSeconds])

  const resetTimer = useCallback(() => {
    clearTick()
    setTimeLeft(null)
  }, [])

  const isWarning = timeLeft !== null && timeLeft <= 30 && timeLeft > 0
  const isExpired = timeLeft === 0

  return { timeLeft, isWarning, isExpired, startTimer, resetTimer }
}
