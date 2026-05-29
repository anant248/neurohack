"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AuthButton } from "@/components/auth/AuthButton"
import "./page.css"

/* ── Floating background shapes ── */
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 80,
  rotate = 0,
  color = "rgba(16,185,129,0.12)",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -120, rotate: rotate - 12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={`absolute pointer-events-none ${className ?? ""}`}
    >
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
      >
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: "999px",
            background: `linear-gradient(135deg, ${color}, transparent)`,
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(2px)",
          }}
        />
      </motion.div>
    </motion.div>
  )
}

/* ── Rotating word in hero heading ── */
const WORDS = ["Ace", "Prep", "Land", "Crush"]

function RotatingWord() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setIdx(i => (i + 1) % WORDS.length), 2200)
    return () => clearTimeout(id)
  }, [idx])

  return (
    <span className="rotating-word-wrap">
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
      {/* Floating shapes */}
      <div className="shapes-layer" aria-hidden="true">
        <ElegantShape delay={0.2} width={560} height={110} rotate={12}  color="rgba(16,185,129,0.1)"  className="left-[-6%] top-[18%]" />
        <ElegantShape delay={0.4} width={420} height={90}  rotate={-14} color="rgba(59,130,246,0.1)"  className="right-[-4%] top-[65%]" />
        <ElegantShape delay={0.35} width={260} height={65} rotate={-7}  color="rgba(124,58,237,0.1)"  className="left-[8%] bottom-[12%]" />
        <ElegantShape delay={0.55} width={180} height={50} rotate={20}  color="rgba(245,158,11,0.08)" className="right-[18%] top-[12%]" />
        <ElegantShape delay={0.65} width={130} height={38} rotate={-22} color="rgba(16,185,129,0.12)" className="left-[24%] top-[8%]" />
      </div>

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
            <Link href="/practice" className="mode-card" data-testid="behavioral-card">
              <div className="mode-card-icon behavioral">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                </svg>
              </div>
              <div className="mode-card-text">
                <div className="mode-card-title">Behavioral Practice</div>
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
                <div className="mode-card-title">Technical Interview</div>
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
