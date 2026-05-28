import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useInterviewTimer } from "@/hooks/useInterviewTimer"

describe("useInterviewTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts with timeLeft null and no warning/expired flags", () => {
    const { result } = renderHook(() => useInterviewTimer(120))
    expect(result.current.timeLeft).toBeNull()
    expect(result.current.isWarning).toBe(false)
    expect(result.current.isExpired).toBe(false)
  })

  it("sets timeLeft to duration on startTimer", () => {
    const { result } = renderHook(() => useInterviewTimer(120))
    act(() => result.current.startTimer())
    expect(result.current.timeLeft).toBe(120)
  })

  it("counts down by 1 each second", () => {
    const { result } = renderHook(() => useInterviewTimer(120))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.timeLeft).toBe(117)
  })

  it("isWarning is true at 30 seconds", () => {
    const { result } = renderHook(() => useInterviewTimer(120))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(90_000)) // 90s elapsed → 30s left
    expect(result.current.timeLeft).toBe(30)
    expect(result.current.isWarning).toBe(true)
  })

  it("isWarning is false above 30 seconds", () => {
    const { result } = renderHook(() => useInterviewTimer(120))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(89_000)) // 89s elapsed → 31s left
    expect(result.current.isWarning).toBe(false)
  })

  it("isExpired is true when timeLeft reaches 0", () => {
    const { result } = renderHook(() => useInterviewTimer(5))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.timeLeft).toBe(0)
    expect(result.current.isExpired).toBe(true)
  })

  it("does not go below 0", () => {
    const { result } = renderHook(() => useInterviewTimer(5))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.timeLeft).toBe(0)
  })

  it("resetTimer sets timeLeft back to null", () => {
    const { result } = renderHook(() => useInterviewTimer(120))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(2000))
    act(() => result.current.resetTimer())
    expect(result.current.timeLeft).toBeNull()
    expect(result.current.isWarning).toBe(false)
    expect(result.current.isExpired).toBe(false)
  })

  it("restarts cleanly if startTimer is called again", () => {
    const { result } = renderHook(() => useInterviewTimer(60))
    act(() => result.current.startTimer())
    act(() => vi.advanceTimersByTime(10_000)) // 50s left
    act(() => result.current.startTimer())    // restart
    expect(result.current.timeLeft).toBe(60)
  })

  it("uses custom duration", () => {
    const { result } = renderHook(() => useInterviewTimer(30))
    act(() => result.current.startTimer())
    expect(result.current.timeLeft).toBe(30)
    // At 30s duration, 0s elapsed means isWarning is true (≤30 and >0)
    expect(result.current.isWarning).toBe(true)
  })
})
