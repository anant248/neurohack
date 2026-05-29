"use client"

import { useEffect, useRef, useState } from "react"
import type { SessionScore } from "@/lib/types"
import { Modal } from "@/components/ui/Modal"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: SessionScore[]
  onClearHistory: () => void
}

export function HistoryModal({ isOpen, onClose, history, onClearHistory }: HistoryModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // Reset confirm state whenever the modal closes
  useEffect(() => {
    if (!isOpen) setShowConfirm(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || history.length === 0) return

    const initChart = async () => {
      const Chart = (await import("chart.js/auto")).default
      const chartCanvas = document.getElementById("historyChart") as HTMLCanvasElement
      if (!chartCanvas || chartRef.current) return

      const ctx = chartCanvas.getContext("2d")
      if (!ctx) return

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: history.map(s => `Attempt ${s.attempt}`),
          datasets: [
            {
              label: "Eye Contact",
              data: history.map(s => s.eyeContactScore),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: "#3b82f6",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
            {
              label: "Expression",
              data: history.map(s => s.expressionScore),
              borderColor: "#8b5cf6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: "#8b5cf6",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { color: "#fff", font: { size: 14, family: "Inter" }, padding: 20, usePointStyle: true },
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 12,
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%` },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { color: "rgba(255,255,255,0.7)", callback: v => `${v}%` },
              grid: { color: "rgba(255,255,255,0.1)" },
            },
            x: {
              ticks: { color: "rgba(255,255,255,0.7)" },
              grid: { color: "rgba(255,255,255,0.1)" },
            },
          },
        },
      })
    }

    initChart()

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [isOpen, history])

  if (!isOpen) return null

  const hasHistory = history.length > 0
  const avgEyeContact = hasHistory
    ? Math.round(history.reduce((sum, s) => sum + s.eyeContactScore, 0) / history.length)
    : 0
  const avgExpression = hasHistory
    ? Math.round(history.reduce((sum, s) => sum + s.expressionScore, 0) / history.length)
    : 0

  const handleClearConfirmed = () => {
    onClearHistory()
    setShowConfirm(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Progress">
      {showConfirm ? (
        /* ── Inline confirmation ── */
        <div className="history-clear-confirm">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="history-clear-confirm-icon">
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="history-clear-confirm-title">Clear session history?</p>
          <p className="history-clear-confirm-sub">
            This will permanently delete all {history.length} recorded session{history.length !== 1 ? "s" : ""}.
            This cannot be undone.
          </p>
          <div className="history-clear-confirm-actions">
            <button
              type="button"
              className="bank-btn bank-btn--ghost"
              onClick={() => setShowConfirm(false)}
            >
              No, keep it
            </button>
            <button
              type="button"
              className="history-clear-yes-btn"
              onClick={handleClearConfirmed}
            >
              Yes, clear all
            </button>
          </div>
        </div>
      ) : (
        /* ── Normal history content ── */
        <>
          {hasHistory ? (
            <>
              <div className="chart-container">
                <canvas id="historyChart" />
              </div>
              <div className="history-stats">
                <div className="stat-card">
                  <span className="stat-label">Total Attempts</span>
                  <span className="stat-value">{history.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Avg Eye Contact</span>
                  <span className="stat-value">{avgEyeContact}%</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Avg Expression</span>
                  <span className="stat-value">{avgExpression}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bank-empty-state">
              <p className="bank-empty-title">No sessions yet</p>
              <p className="bank-empty-sub">Record a practice session to see your progress here.</p>
            </div>
          )}

          {hasHistory && (
            <button
              type="button"
              className="history-clear-btn"
              onClick={() => setShowConfirm(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Clear history
            </button>
          )}
        </>
      )}
    </Modal>
  )
}
