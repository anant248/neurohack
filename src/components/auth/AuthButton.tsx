"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"

export function AuthButton() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on click-outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const signOut = async () => {
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) return <div className="auth-btn-skeleton" aria-hidden />

  if (!user) {
    return (
      <a href="/auth" className="topbar-signin-btn">
        Sign In
      </a>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials = (user.email?.[0] ?? "U").toUpperCase()

  return (
    <div className="auth-fab" ref={wrapperRef}>
      {/* Trigger: avatar / X toggle */}
      <button
        className={`auth-fab-trigger${open ? " auth-fab-trigger--open" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Close menu" : "User menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="auth-fab-avatar" referrerPolicy="no-referrer" />
        ) : (
          <span className="auth-fab-initial">{initials}</span>
        )}
      </button>

      {/* Floating menu — drops down */}
      {open && (
        <div className="auth-fab-menu" role="menu">
          <a
            href="/auth"
            className="auth-fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ animationDelay: "0ms" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            Account
          </a>

          <a
            href="/auth"
            className="auth-fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ animationDelay: "55ms" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
            </svg>
            Settings
          </a>

          <button
            className="auth-fab-item auth-fab-item--logout"
            role="menuitem"
            onClick={signOut}
            style={{ animationDelay: "110ms" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
