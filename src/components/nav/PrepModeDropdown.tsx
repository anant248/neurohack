"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import "./prep-mode-dropdown.css"

const MODES = [
  {
    href: "/coffee-chats",
    title: "Coffee Chats",
    desc: "Networking notes & question prep",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: "rgba(245, 158, 11, 0.15)",
    accentBorder: "rgba(245, 158, 11, 0.25)",
    accentColor: "#f59e0b",
  },
  {
    href: "/practice",
    title: "Behavioural",
    desc: "AI coaching on eye contact & expression",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
      </svg>
    ),
    accent: "rgba(16, 185, 129, 0.15)",
    accentBorder: "rgba(16, 185, 129, 0.25)",
    accentColor: "#10b981",
  },
  {
    href: "/technical",
    title: "Technical",
    desc: "Daily LeetCode with code editor & AI review",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 6L2.5 12L8 18M16 6L21.5 12L16 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: "rgba(59, 130, 246, 0.15)",
    accentBorder: "rgba(59, 130, 246, 0.25)",
    accentColor: "#60a5fa",
  },
]

export function PrepModeDropdown() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onOutside)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onOutside)
    }
  }, [open])

  return (
    <div className="pmd-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`pmd-trigger${open ? " pmd-trigger--open" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Prep Mode
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="pmd-chevron">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="pmd-panel" role="menu">
          {MODES.map(m => (
            <Link
              key={m.href}
              href={m.href}
              className="pmd-card"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <div
                className="pmd-card-icon"
                style={{
                  background: m.accent,
                  border: `1px solid ${m.accentBorder}`,
                  color: m.accentColor,
                }}
              >
                {m.icon}
              </div>
              <div>
                <div className="pmd-card-title">{m.title}</div>
                <div className="pmd-card-desc">{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
