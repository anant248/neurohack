"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Tab = "login" | "signup"
type View = "auth" | "forgot" | "check-email"
type OAuthProvider = "google" | "github"

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function onEnter(fn: () => void) {
  return (e: React.KeyboardEvent) => { if (e.key === "Enter") fn() }
}

export function AuthForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("login")
  const [view, setView] = useState<View>("auth")

  // Form fields — cleared on tab switch to prevent cross-tab persistence
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "oauth_failed") {
      setError("Sign-in failed. Please try again.")
    }
  }, [])

  const clearMessages = () => { setError(null); setSuccessMsg(null) }

  const handleTabSwitch = (t: Tab) => {
    // Clear all fields immediately so the browser never sees a filled password
    // field being removed from the DOM (which triggers the "save password?" prompt)
    setFullName("")
    setEmail("")
    setPassword("")
    setShowPassword(false)
    setTab(t)
    setView("auth")
    clearMessages()
  }

  // ── OAuth ──────────────────────────────────────────────────────────────────
  const signInWithOAuth = async (provider: OAuthProvider) => {
    setLoading(provider)
    clearMessages()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(null) }
  }

  // ── Email sign-up ──────────────────────────────────────────────────────────
  const handleSignUp = async () => {
    if (!fullName.trim()) { setError("Full name is required."); return }
    if (!email.trim()) { setError("Email is required."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }

    setLoading("signup")
    clearMessages()
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    })

    if (error) { setError(error.message); setLoading(null); return }

    if (data.session) {
      router.push("/practice")
    } else {
      setSuccessMsg("Check your email to confirm your account, then log in.")
      setLoading(null)
      setView("check-email")
    }
  }

  // ── Email sign-in ──────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    if (!email.trim()) { setError("Email is required."); return }
    if (!password) { setError("Password is required."); return }

    setLoading("login")
    clearMessages()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) { setError(error.message); setLoading(null) }
    else { router.push("/practice") }
  }

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { setError("Email is required."); return }

    setLoading("forgot")
    clearMessages()
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) { setError(error.message); setLoading(null) }
    else {
      setSuccessMsg("If an account exists for that email, a reset link has been sent.")
      setView("check-email")
      setLoading(null)
    }
  }

  const isLoading = loading !== null

  // ── Forgot password view ───────────────────────────────────────────────────
  if (view === "forgot") {
    return (
      <div className="auth-layout">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            </svg>
          </div>

          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link.</p>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-field-label">
                Email Address<span className="auth-required">*</span>
              </label>
              <input
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={onEnter(handleForgotPassword)}
                autoFocus
              />
            </div>

            <button type="button" className="auth-submit-btn" disabled={isLoading} onClick={handleForgotPassword}>
              {loading === "forgot" ? <span className="auth-spinner" /> : "Send Reset Link"}
            </button>
          </div>

          <button
            type="button"
            className="auth-back-link"
            onClick={() => { setView("auth"); clearMessages(); setForgotEmail("") }}
          >
            ← Back to Log In
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Check email / success view ─────────────────────────────────────────────
  if (view === "check-email") {
    return (
      <div className="auth-layout">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            </svg>
          </div>

          <div className="auth-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">{successMsg}</p>

          <button
            type="button"
            className="auth-back-link"
            onClick={() => { setView("auth"); setTab("login"); clearMessages() }}
          >
            ← Back to Log In
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Main auth view (login / signup tabs) ───────────────────────────────────
  const title = tab === "login" ? "Welcome back" : "Create account"

  return (
    <div className="auth-layout">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Logo */}
        <div className="auth-logo-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
          </svg>
        </div>

        <h1 className="auth-title">{title}</h1>

        {/* Tabs */}
        <div className="auth-tab-row" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "login"}
            className={`auth-tab${tab === "login" ? " auth-tab--active" : ""}`}
            onClick={() => handleTabSwitch("login")}
            type="button"
          >
            Log In
          </button>
          <button
            role="tab"
            aria-selected={tab === "signup"}
            className={`auth-tab${tab === "signup" ? " auth-tab--active" : ""}`}
            onClick={() => handleTabSwitch("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {/*
          Both forms stay in the DOM at all times (toggled via display:none).
          Removing a <input type="password"> that had content triggers Safari's
          "Save Password?" prompt even without a real submission. Keeping the
          node in the DOM prevents that — the prompt only fires on actual submit.
        */}

        {/* ── Sign Up fields ── */}
        <div className="auth-form" style={tab !== "signup" ? { display: "none" } : undefined} aria-hidden={tab !== "signup"}>
          <div className="auth-field">
            <label className="auth-field-label">
              Full Name<span className="auth-required">*</span>
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
              tabIndex={tab !== "signup" ? -1 : undefined}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">
              Email Address<span className="auth-required">*</span>
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              tabIndex={tab !== "signup" ? -1 : undefined}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">
              Password<span className="auth-required">*</span>
            </label>
            <div className="auth-pw-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input--pw"
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onEnter(handleSignUp)}
                autoComplete="new-password"
                tabIndex={tab !== "signup" ? -1 : undefined}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={tab !== "signup" ? -1 : undefined}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="button" className="auth-submit-btn" disabled={isLoading} onClick={handleSignUp} tabIndex={tab !== "signup" ? -1 : undefined}>
            {loading === "signup" ? <span className="auth-spinner" /> : "Sign Up"}
          </button>
        </div>

        {/* ── Log In fields ── */}
        <div className="auth-form" style={tab !== "login" ? { display: "none" } : undefined} aria-hidden={tab !== "login"}>
          <div className="auth-field">
            <label className="auth-field-label">
              Email Address<span className="auth-required">*</span>
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              tabIndex={tab !== "login" ? -1 : undefined}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">
              Password<span className="auth-required">*</span>
            </label>
            <div className="auth-pw-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input--pw"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onEnter(handleSignIn)}
                autoComplete="current-password"
                tabIndex={tab !== "login" ? -1 : undefined}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={tab !== "login" ? -1 : undefined}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="button" className="auth-submit-btn" disabled={isLoading} onClick={handleSignIn} tabIndex={tab !== "login" ? -1 : undefined}>
            {loading === "login" ? <span className="auth-spinner" /> : "Log In"}
          </button>

          <button
            type="button"
            className="auth-forgot-link"
            onClick={() => { setView("forgot"); clearMessages(); setForgotEmail(email) }}
            tabIndex={tab !== "login" ? -1 : undefined}
          >
            Forgot your password?
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider"><span>or</span></div>

        {/* OAuth providers */}
        <div className="auth-providers">
          <button
            type="button"
            onClick={() => signInWithOAuth("google")}
            disabled={isLoading}
            className="auth-provider-btn"
          >
            {loading === "google" ? (
              <span className="auth-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => signInWithOAuth("github")}
            disabled={isLoading}
            className="auth-provider-btn"
          >
            {loading === "github" ? (
              <span className="auth-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        <a href="/practice" className="auth-skip-link">
          Continue without signing in →
        </a>
      </motion.div>
    </div>
  )
}
