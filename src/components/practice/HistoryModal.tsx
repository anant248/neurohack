"use client"

import { useEffect, useRef } from "react"
import type { SessionScore } from "@/lib/types"
import { Modal } from "@/components/ui/Modal"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: SessionScore[]
}

export function HistoryModal({ isOpen, onClose, history }: HistoryModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null)

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

  const avgEyeContact = Math.round(history.reduce((sum, s) => sum + s.eyeContactScore, 0) / history.length)
  const avgExpression = Math.round(history.reduce((sum, s) => sum + s.expressionScore, 0) / history.length)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Progress">
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
    </Modal>
  )
}
