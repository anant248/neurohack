import Link from "next/link"
import { AuthButton } from "@/components/auth/AuthButton"
import "./page.css"

export default function RootPage() {
  return (
    <div className="landing-layout">
      <header className="landing-topbar">
        <div className="topbar-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill="currentColor"
            />
          </svg>
          Interprep
        </div>
        <div className="topbar-actions">
          <AuthButton />
        </div>
      </header>

      <main className="landing-main">
        <div className="landing-hero">
          <h1>Ace your next interview</h1>
          <p>
            Practice behavioral questions with real-time AI coaching, or sharpen your coding skills
            with today&apos;s LeetCode challenge — all in one place.
          </p>
        </div>

        <div className="mode-cards">
          {/* Behavioral Practice */}
          <Link href="/practice" className="mode-card" data-testid="behavioral-card">
            <div className="mode-card-icon behavioral">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="mode-card-title">Behavioral Practice</div>
            <div className="mode-card-desc">
              Answer common interview questions on camera. AI analyzes your eye contact and
              expressions, then gives personalised coaching.
            </div>

            <div className="mode-card-features">
              <span className="feature-pill behavioral">Eye contact tracking</span>
              <span className="feature-pill behavioral">Expression analysis</span>
              <span className="feature-pill behavioral">AI feedback</span>
            </div>

            <div className="mode-card-cta behavioral">
              Start practicing
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

          {/* Technical Interview */}
          <Link href="/technical" className="mode-card" data-testid="technical-card">
            <div className="mode-card-icon technical">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 6.00067L2.5 12L8 18M16 6L21.5 12L16 18"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="mode-card-title">Technical Interview</div>
            <div className="mode-card-desc">
              Solve today&apos;s LeetCode daily challenge in a real code editor with syntax
              highlighting, optional webcam, and language switching.
            </div>

            <div className="mode-card-features">
              <span className="feature-pill technical">Daily LeetCode</span>
              <span className="feature-pill technical">Code editor</span>
              <span className="feature-pill technical">JS / Python</span>
            </div>

            <div className="mode-card-cta technical">
              Start coding
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
