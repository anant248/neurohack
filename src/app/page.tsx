"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AuthButton } from "@/components/auth/AuthButton"
import "./page.css"

/* ── Rotating word in hero heading ── */
const WORDS = ["Ace", "Prep", "Land", "Crush"]

function RotatingWord() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setIdx(i => (i + 1) % WORDS.length), 2200)
    return () => clearTimeout(id)
  }, [idx])

  return (
    /* hidden "Crush" sets the width; rotating spans overlay it */
    <span className="rotating-word-wrap">
      <span className="rotating-word-sizer" aria-hidden="true">Crush</span>
      {WORDS.map((word, i) => (
        <motion.span
          key={word}
          className="rotating-word"
          initial={{ opacity: 0, y: 60 }}
          animate={i === idx ? { opacity: 1, y: 0 } : { opacity: 0, y: i < idx ? -60 : 60 }}
          transition={{ type: "spring", stiffness: 55, damping: 14 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
}

export default function RootPage() {
  return (
    <div className="landing-layout">

      {/* ── Top bar ── */}
      <header className="landing-topbar">
        <div className="topbar-inner">
          <div className="topbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            </svg>
            <span>Interprep</span>
          </div>
          <div className="topbar-actions">
            <AuthButton />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="landing-hero">
        <div className="hero-content">
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="hero-badge">
            <span className="hero-badge-dot" />
            AI Interview Coach
          </motion.div>

          {/* Heading */}
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="hero-heading">
            <RotatingWord />
            <br />
            <span className="hero-heading-sub">your next interview</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="hero-subtitle">
            Practice behavioral questions with real-time AI coaching, or sharpen your
            coding skills with today&apos;s LeetCode challenge.
          </motion.p>

          {/* Mode cards */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mode-cards">
            <Link href="/coffee-chats" className="mode-card" data-testid="coffee-chats-card">
              <div className="mode-card-icon coffee-chats">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mode-card-text">
                <div className="mode-card-title">Coffee Chats</div>
                <div className="mode-card-desc">Networking notes &amp; question prep</div>
              </div>
              <svg className="mode-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <Link href="/practice" className="mode-card" data-testid="behavioral-card">
              <div className="mode-card-icon behavioral">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                </svg>
              </div>
              <div className="mode-card-text">
                <div className="mode-card-title">Behavioural</div>
                <div className="mode-card-desc">AI coaching on eye contact &amp; expression</div>
              </div>
              <svg className="mode-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <Link href="/technical" className="mode-card" data-testid="technical-card">
              <div className="mode-card-icon technical">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 6L2.5 12L8 18M16 6L21.5 12L16 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mode-card-text">
                <div className="mode-card-title">Technical</div>
                <div className="mode-card-desc">Daily LeetCode with code editor &amp; AI review</div>
              </div>
              <svg className="mode-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
