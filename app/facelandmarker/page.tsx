"use client";

import { useEffect, useState, useRef } from "react";
import "./styles.css";

declare global {
  interface Window {
    startWebcamTracking: () => void;
    stopWebcamTracking: () => Promise<any>;
  }
}

interface SessionScore {
  attempt: number;
  eyeContactScore: number;
  expressionScore: number;
  timestamp: Date;
}

export default function FaceLandmarkerPage() {
  const [loaded, setLoaded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionScore[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  // -------------------------
  // INTERVIEW QUESTIONS
  // -------------------------
  const questions = [
    "Tell me about yourself.",
    "What is your greatest strength?",
    "What is your greatest weakness?",
    "Describe a challenge you overcame.",
    "Why are you interested in this position?",
    "Tell me about a time you worked in a team.",
    "How do you handle stress?",
    "Describe a conflict and how you resolved it."
  ];

  const [selectedQuestion, setSelectedQuestion] = useState("");

  useEffect(() => {
    // Load MediaPipe script dynamically ONLY in browser
    const load = async () => {
      await import("./facelandmarker.js");
      setLoaded(true);
    };
    load();
  }, []);

  // Initialize chart when history modal opens
  useEffect(() => {
    if (showHistory && sessionHistory.length > 0) {
      const initChart = async () => {
        const Chart = (await import('chart.js/auto')).default;
        const chartCanvas = document.getElementById('historyChart') as HTMLCanvasElement;
        
        if (chartCanvas && !chartRef.current) {
          const ctx = chartCanvas.getContext('2d');
          if (ctx) {
            chartRef.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels: sessionHistory.map(s => `Attempt ${s.attempt}`),
                datasets: [
                  {
                    label: 'Eye Contact',
                    data: sessionHistory.map(s => s.eyeContactScore),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                  },
                  {
                    label: 'Expression',
                    data: sessionHistory.map(s => s.expressionScore),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: {
                      color: '#fff',
                      font: {
                        size: 14,
                        family: 'Inter'
                      },
                      padding: 20,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y + '%';
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: {
                        size: 12
                      },
                      callback: function(value) {
                        return value + '%';
                      }
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    }
                  },
                  x: {
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: {
                        size: 12
                      }
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    }
                  }
                }
              }
            });
          }
        }
      };
      
      initChart();
    }
    
    // Cleanup chart when modal closes
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [showHistory, sessionHistory]);

  // Draw placeholder on canvas
  useEffect(() => {
    if (!recording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 640;
        canvas.height = 480;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw camera icon (simple circles)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 60, canvas.height / 2 - 40, 120, 80, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + 50, canvas.height / 2 - 50, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ready to begin your interview', canvas.width / 2, canvas.height / 2 + 80);
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Click "Start Recording" when ready', canvas.width / 2, canvas.height / 2 + 110);
      }
    }
  }, [recording]);

  // -------------------------
  // Recording controls
  // -------------------------
  const startRecording = () => {
    if (!loaded) return alert("Model is still loading...");
    if (!selectedQuestion) return alert("Please select a question first!");
    setResults(null);
    setRecording(true);
    window.startWebcamTracking(); // Exposed by facelandmarker.js
  };

  const stopRecording = async () => {
    setRecording(false);
    setAnalyzing(true);

    const scores = await window.stopWebcamTracking(); // returns metrics
    setResults(scores);

    // Add to session history
    setSessionHistory(prev => [...prev, {
      attempt: prev.length + 1,
      eyeContactScore: scores.eyeContactScore,
      expressionScore: scores.expressionScore,
      timestamp: new Date()
    }]);

    setAnalyzing(false);
  };

  return (
    <div className="container">
      {/* History Button - Fixed Position */}
      {sessionHistory.length > 0 && (
        <button className="history-btn" onClick={() => setShowHistory(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3v8h8M21 21v-8h-8M3 11c0-4.97 4.03-9 9-9 2.5 0 4.74 1.01 6.36 2.64M21 13c0 4.97-4.03 9-9 9-2.5 0-4.74-1.01-6.36-2.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          View History ({sessionHistory.length})
        </button>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Session Progress</h2>
              <button className="modal-close" onClick={() => setShowHistory(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="chart-container">
              <canvas id="historyChart"></canvas>
            </div>

            <div className="history-stats">
              <div className="stat-card">
                <span className="stat-label">Total Attempts</span>
                <span className="stat-value">{sessionHistory.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Avg Eye Contact</span>
                <span className="stat-value">
                  {Math.round(sessionHistory.reduce((sum, s) => sum + s.eyeContactScore, 0) / sessionHistory.length)}%
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Avg Expression</span>
                <span className="stat-value">
                  {Math.round(sessionHistory.reduce((sum, s) => sum + s.expressionScore, 0) / sessionHistory.length)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="header-section">
        <div className="icon-badge">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="main-title">Let&apos;s Ace That Interview.</h1>
        <p className="subtitle">Perfect your interview presence with real-time feedback</p>
      </div>

      {/* ----------------------------- */}
      {/* QUESTION SELECTOR */}
      {/* ----------------------------- */}
      <div className="question-card">
        <div className="step-indicator">
          <span className="step-number">1</span>
          <h2 className="step-title">Select Your Question</h2>
        </div>

        <select
          className="question-dropdown"
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
        >
          <option value="">Choose an interview question...</option>
          {questions.map((q, idx) => (
            <option key={idx} value={q}>
              {q}
            </option>
          ))}
        </select>

        <button className="secondary-btn"
          onClick={() => {
            const random = questions[Math.floor(Math.random() * questions.length)];
            setSelectedQuestion(random);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
          </svg>
          Random Question
        </button>
        
        {selectedQuestion && (
          <div className="selected-question-box">
            <div className="question-icon">❝</div>
            <p className="selected-question">{selectedQuestion}</p>
          </div>
        )}
      </div>

      {/* ----------------------------- */}
      {/* WEBCAM + CANVAS */}
      {/* ----------------------------- */}
      <div className="card">
        <div className="step-indicator">
          <span className="step-number">2</span>
          <h2 className="step-title">Practice Your Response</h2>
        </div>
        <p className="step-description">
          Look into the camera and answer naturally. We&apos;ll analyze your eye contact, 
          facial expressions, and body language in real-time.
        </p>

        <div className="video-wrapper">
          <video
            id="webcam"
            autoPlay
            muted
            playsInline
            style={{ display: recording ? "block" : "none" }}
          ></video>

          <canvas
            id="output_canvas"
            ref={canvasRef}
          ></canvas>

          {recording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              REC
            </div>
          )}
        </div>

        {/* START / STOP BUTTONS */}
        {!recording && (
          <button 
            className={`primary-btn ${!loaded || !selectedQuestion ? 'disabled' : ''}`} 
            onClick={startRecording}
            disabled={!loaded || !selectedQuestion}
          >
            {!loaded ? (
              <>
                <span className="spinner"></span>
                Loading AI Model...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
                Start Recording
              </>
            )}
          </button>
        )}

        {recording && (
          <button className="stop-btn" onClick={stopRecording}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
            </svg>
            Stop & Analyze
          </button>
        )}

        {analyzing && (
          <div className="analyzing-state">
            <div className="analyzing-spinner"></div>
            <p className="analyzing-text">Analyzing your performance...</p>
          </div>
        )}
      </div>

      {/* ----------------------------- */}
      {/* RESULTS */}
      {/* ----------------------------- */}
      {results && (
        <div className="results-card">
          <div className="results-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
            </svg>
            <h2>Your Interview Insights</h2>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon eye-contact">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-label">Eye Contact</span>
                <span className="metric-value">{results.eyeContactScore}%</span>
              </div>
              <div className="metric-bar">
                <div className="metric-fill eye-contact-fill" style={{width: `${results.eyeContactScore}%`}}></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon expression">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-label">Expression Score</span>
                <span className="metric-value">{results.expressionScore}%</span>
              </div>
              <div className="metric-bar">
                <div className="metric-fill expression-fill" style={{width: `${results.expressionScore}%`}}></div>
              </div>
            </div>
          </div>

          <div className="feedback-section">
            <h3 className="feedback-title">AI Feedback</h3>
            <p className="feedback-text">{results.feedback}</p>
          </div>

          <button className="retry-btn" onClick={() => setResults(null)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
            </svg>
            Try Another Question
          </button>
        </div>
      )}
    </div>
  );
}