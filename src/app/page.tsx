"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion"
import Lenis from "lenis"
import { AuthButton } from "@/components/auth/AuthButton"
import { PrepModeDropdown } from "@/components/nav/PrepModeDropdown"
import { createClient } from "@/lib/supabase/client"
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

/* ── Demo showcase section — scroll-stacking video cards ── */
const DEMOS = [
  {
    id: "coffee-chats",
    video: "/videos/coffee-chats.mp4",
    poster: "/screenshots/coffee-chats.png",
    title: "Show up prepared for every coffee chat",
    desc: "Keep networking notes, prep tailored questions, and track follow-ups so every conversation moves you forward.",
  },
  {
    id: "behavioural",
    video: "/videos/behavioural.mp4",
    poster: "/screenshots/practice.png",
    title: "Questions tailored to the role, with instant feedback",
    desc: "Answer on camera while AI scores your eye contact and expression, then get specific feedback to improve.",
  },
  {
    id: "technical",
    video: "/videos/technical.mp4",
    poster: "/screenshots/technical.png",
    title: "Daily coding practice in Python or JavaScript",
    desc: "Solve the daily LeetCode in an in-browser editor, run tests, and get an AI code review.",
  },
]

function DemoCard({
  demo,
  index,
  count,
  progress,
  pinned,
  setVideoRef,
}: {
  demo: (typeof DEMOS)[number]
  index: number
  count: number
  progress: MotionValue<number>
  pinned: boolean
  setVideoRef: (el: HTMLVideoElement | null) => void
}) {
  // Card 0 is the base layer; each later card slides up from below the frame
  // (y: 100% → 0%) as scroll progress crosses its segment, overlaying the one
  // before it. Hooks run unconditionally; the transform is only bound to the
  // style when pinning is active.
  const segStart = (index - 1) / (count - 1)
  const segEnd = index / (count - 1)
  const y = useTransform(
    progress,
    index === 0 ? [0, 1] : [segStart, segEnd],
    index === 0 ? ["0%", "0%"] : ["100%", "0%"],
  )

  return (
    <motion.article className="demo-card" style={pinned ? { y, zIndex: index } : undefined}>
      <div className="demo-card-inner">
        <div className="demo-card-media">
          <video
            ref={setVideoRef}
            className="demo-card-video"
            src={demo.video}
            poster={demo.poster}
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className="demo-card-text">
          <h3 className="demo-card-title">{demo.title}</h3>
          <p className="demo-card-desc">{demo.desc}</p>
        </div>
      </div>
    </motion.article>
  )
}

function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(true)
  const N = DEMOS.length

  // Progress of scrolling through the tall outer (0 = section top at viewport
  // top, 1 = section bottom at viewport bottom). The inner is sticky, so the
  // page appears "held" while the cards animate by this progress.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Disable scroll-pinning on small screens / reduced-motion — fall back to a
  // normal vertical list.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)")
    const update = () => setPinned(!mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Front-most card from scroll progress → play only that video, pause others.
  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(N - 1, Math.max(0, Math.round(v * (N - 1))))
    setActive(prev => (prev === idx ? prev : idx))
  })

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        const p = v.play()
        if (p) p.catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [active])

  return (
    <section className="demo-section">
      <Reveal className="demo-header">
        <p className="demo-eyebrow">See it in action</p>
        <h2 className="demo-heading">Everything you need to walk in confident</h2>
      </Reveal>
      <div className={`demo-pin${pinned ? "" : " demo-pin--static"}`} ref={sectionRef}>
        <div className="demo-pin-inner">
          {DEMOS.map((d, i) => (
            <DemoCard
              key={d.id}
              demo={d}
              index={i}
              count={N}
              progress={scrollYProgress}
              pinned={pinned}
              setVideoRef={el => { videoRefs.current[i] = el }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA section ── */
function CTASection() {
  const router = useRouter()

  // Route instantly using the locally-cached session (no network round-trip):
  // signed-in users skip straight to practice, everyone else to sign-in. The
  // href stays /auth for prefetch + no-JS fallback.
  const handleGetStarted = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const { data } = await createClient().auth.getSession()
      router.push(data.session ? "/practice" : "/auth")
    } catch {
      router.push("/auth")
    }
  }

  return (
    <motion.section
      className="cta-section"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <h2 className="cta-heading">Ready to ace your next interview?</h2>
      <p className="cta-sub">
        Practice every type of interview question in one place. No account needed to get started.
      </p>
      <div className="cta-actions">
        <Link href="/auth" className="cta-btn-primary" onClick={handleGetStarted}>Get started</Link>
      </div>
    </motion.section>
  )
}

/* ── FAQ section ── */
const FAQS = [
  {
    q: "Is Interprep really free?",
    a: "Yes, all three practice modes are completely free.",
  },
  {
    q: "Do I need to create an account to practice?",
    a: "No account needed. All features work immediately in your browser. Sign up only if you want to save your history and sync across devices.",
  },
  {
    q: "How does face tracking work? Is my video recorded?",
    a: "The Behavioural page uses MediaPipe, a Google AI library that runs entirely in your browser using WebAssembly. No video is ever sent to our servers and all processing happens locally on your device.",
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
      <Reveal>
        <h2 className="faq-heading">Questions? We&apos;ve got answers.</h2>
      </Reveal>
      <div className="faq-list">
        {FAQS.map((item, i) => (
          <motion.div
            key={i}
            className={`faq-item${open === i ? " faq-item--open" : ""}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.14, ease: [0.25, 0.4, 0.25, 1] }}
          >
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
          </motion.div>
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

/* ── Scroll-reveal wrapper: fades a section up the first time it enters view ── */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export default function RootPage() {
  useEffect(() => {
    // Momentum smooth-scroll — the "recoil" easing where the page glides to a
    // stop. Lenis animates real scroll position, so the demo pin (position:
    // sticky + useScroll) keeps working. Skipped under reduced-motion. The
    // homepage scrolls on the window; the :has() rules in page.css keep the
    // shell scrollable even after another route's global overflow CSS lingers.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

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
      <DemoSection />
      <div className="landing-below">
        <CTASection />
        <FAQSection />
      </div>

    </div>
  )
}
