"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AuthButton } from "@/components/auth/AuthButton"
import { PrepModeDropdown } from "@/components/nav/PrepModeDropdown"
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
    /* hidden "Crush" reserves the width; AnimatePresence swaps the active word */
    <span className="rotating-word-wrap">
      <span className="rotating-word-sizer" aria-hidden="true">Crush</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          className="rotating-word"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: "spring", stiffness: 55, damping: 14 }}
        >
          {WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ── Demo showcase section ── */
const DEMOS = [
  { id: "coffee-chats", label: "Coffee Chats",  img: "/screenshots/coffee-chats.png" },
  { id: "practice",     label: "Behavioural",   img: "/screenshots/practice.png" },
  { id: "technical",    label: "Technical",     img: "/screenshots/technical.png" },
]

function DemoSection() {
  const [active, setActive] = useState("coffee-chats")
  const [imgError, setImgError] = useState<Record<string, boolean>>({})
  const demo = DEMOS.find(d => d.id === active)!

  return (
    <section className="demo-section">
      <p className="demo-eyebrow">See it in action</p>
      <h2 className="demo-heading">Everything you need to walk in confident</h2>
      <div className="demo-tabs">
        {DEMOS.map(d => (
          <button
            key={d.id}
            type="button"
            className={`demo-tab${active === d.id ? " demo-tab--active" : ""}`}
            onClick={() => setActive(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="demo-frame">
        <div className="demo-chrome">
          <span className="demo-dot demo-dot--red" />
          <span className="demo-dot demo-dot--yellow" />
          <span className="demo-dot demo-dot--green" />
          <span className="demo-url">neurohack25.vercel.app/{active}</span>
        </div>
        <div className="demo-content-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="demo-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {imgError[active] ? (
                <div className="demo-placeholder">
                  <p className="demo-placeholder-label">{demo.label}</p>
                  <p className="demo-placeholder-hint">Screenshot coming soon</p>
                </div>
              ) : (
                <img
                  src={demo.img}
                  alt={demo.label}
                  className="demo-screenshot"
                  onError={() => setImgError(e => ({ ...e, [active]: true }))}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ── CTA section ── */
function CTASection() {
  return (
    <section className="cta-section">
      <h2 className="cta-heading">Ready to ace your next interview?</h2>
      <p className="cta-sub">
        Practice every type of interview question in one place — no account required to start.
      </p>
      <div className="cta-actions">
        <Link href="/auth" className="cta-btn-primary">Get started</Link>
      </div>
    </section>
  )
}

/* ── FAQ section ── */
const FAQS = [
  {
    q: "Is Interprep free to use?",
    a: "Yes — all three practice modes are completely free. Sign up to save your session history and STAR stories across devices.",
  },
  {
    q: "Do I need to create an account to practice?",
    a: "No account needed. All features work immediately in your browser. Sign up only if you want to save your history and sync across devices.",
  },
  {
    q: "How does face tracking work? Is my video recorded?",
    a: "The Behavioural page uses MediaPipe, a Google AI library that runs entirely in your browser using WebAssembly. No video is ever sent to our servers — all processing happens locally on your device.",
  },
  {
    q: "What coding problems appear on the Technical page?",
    a: "We pull the official LeetCode Daily Challenge fresh each day. You can code in JavaScript or Python, run test cases in-browser, and get an AI code review powered by Gemini.",
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="faq-section">
      <h2 className="faq-heading">Frequently asked questions</h2>
      <div className="faq-list">
        {FAQS.map((item, i) => (
          <div key={i} className={`faq-item${open === i ? " faq-item--open" : ""}`}>
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{item.q}</span>
              <span className="faq-icon">{open === i ? "−" : "+"}</span>
            </button>
            <div className="faq-body">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── fade-up variant for hero elements ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.15, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
}

export default function RootPage() {
  return (
    <div className="landing-layout">

      {/* ── Floating top bar ── */}
      <header className="landing-topbar">
        <div className="topbar-inner">
          <Link href="/" className="topbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            </svg>
            <span>Interprep</span>
          </Link>
          <div className="topbar-nav">
            <PrepModeDropdown />
          </div>
          <div className="topbar-actions">
            <AuthButton />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-content">
          {/* Heading */}
          <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible" className="hero-heading">
            <RotatingWord />
            <br />
            <span className="hero-heading-sub">your next interview</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible" className="hero-subtitle">
            Practice behavioral questions with real-time AI coaching, or sharpen your
            coding skills with today&apos;s LeetCode challenge.
          </motion.p>

          {/* Mode cards */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mode-cards">
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
      </section>

      {/* ── Below-fold content ── */}
      <div className="landing-below">
        <DemoSection />
        <CTASection />
        <FAQSection />
      </div>

    </div>
  )
}
