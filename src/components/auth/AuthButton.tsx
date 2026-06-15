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
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "") as string
  const initials = fullName.trim()
    ? fullName.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "U").toUpperCase()

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
          <button
            className="auth-fab-item auth-fab-item--logout"
            role="menuitem"
            onClick={signOut}
            style={{ animationDelay: "0ms" }}
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
