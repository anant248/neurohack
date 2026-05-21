"use client"

import { type RefObject, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface VideoCaptureProps {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  isReady: boolean
  isRecording: boolean
  isAnalyzing: boolean
  hasQuestion: boolean
  onStart: () => void
  onStop: () => void
}

export function VideoCapture({
  videoRef,
  canvasRef,
  isReady,
  isRecording,
  isAnalyzing,
  hasQuestion,
  onStart,
  onStop,
}: VideoCaptureProps) {
  // Draw placeholder when not recording; clear to transparent when recording
  // so the live video underneath shows through.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (isRecording) {
      // Make canvas transparent — the video element below shows through
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Idle state: draw placeholder graphic
    canvas.width = 1280
    canvas.height = 720

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(1, "#16213e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(canvas.width / 2 - 60, canvas.height / 2 - 40, 120, 80, 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(canvas.width / 2 + 50, canvas.height / 2 - 50, 15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 25, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = "28px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Ready to begin your interview", canvas.width / 2, canvas.height / 2 + 80)
    ctx.font = "18px Inter, system-ui, sans-serif"
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.fillText('Click "Start Recording" when ready', canvas.width / 2, canvas.height / 2 + 120)
  }, [isRecording, canvasRef])

  const canStart = isReady && hasQuestion && !isRecording && !isAnalyzing

  return (
    <Card>
      <div className="step-indicator">
        <span className="step-number">2</span>
        <h2 className="step-title">Practice Your Response</h2>
      </div>
      <p className="step-description">
        Look into the camera and answer naturally. We&apos;ll analyze your eye contact,
        facial expressions, and body language in real-time.
      </p>

      <div className="video-wrapper">
        {/* Video sits below the canvas; stream only flows when recording */}
        <video ref={videoRef} autoPlay muted playsInline />
        {/* Canvas is always on top: placeholder when idle, transparent when recording */}
        <canvas ref={canvasRef} />
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot" />
            REC
          </div>
        )}
      </div>

      {!isRecording && !isAnalyzing && (
        <Button
          variant="primary"
          onClick={onStart}
          disabled={!canStart}
          type="button"
        >
          {!isReady ? (
            <>
              <span className="spinner" />
              Loading AI Model...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              Start Recording
            </>
          )}
        </Button>
      )}

      {isRecording && (
        <Button variant="stop" onClick={onStop} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
          </svg>
          Stop &amp; Analyze
        </Button>
      )}

      {isAnalyzing && (
        <div className="analyzing-state">
          <div className="analyzing-spinner" />
          <p className="analyzing-text">Analyzing your performance...</p>
        </div>
      )}
    </Card>
  )
}
