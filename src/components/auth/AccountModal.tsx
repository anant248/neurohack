"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import "./account-modal.css"

interface AccountModalProps {
  user: User
  onClose: () => void
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AccountModal({ user, onClose }: AccountModalProps) {
  const router = useRouter()
  const supabase = createClient()

  const currentFullName =
    (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "") as string

  // Profile
  const [fullName, setFullName] = useState(currentFullName)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Password
  const [oldPw, setOldPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Only email-provider users can change password
  const hasEmailAuth = user.identities?.some(i => i.provider === "email") ?? false

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!fullName.trim()) { setProfileMsg({ text: "Full name cannot be empty.", ok: false }); return }
    setProfileSaving(true)
    setProfileMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } })
    setProfileSaving(false)
    if (error) {
      setProfileMsg({ text: error.message, ok: false })
    } else {
      setProfileMsg({ text: "Name updated.", ok: true })
      router.refresh()
    }
  }

  // ── Update password ───────────────────────────────────────────────────────
  const updatePassword = async () => {
    if (!oldPw) { setPwMsg({ text: "Enter your current password.", ok: false }); return }
    if (newPw.length < 6) { setPwMsg({ text: "New password must be at least 6 characters.", ok: false }); return }
    if (newPw !== confirmPw) { setPwMsg({ text: "New passwords don't match.", ok: false }); return }

    setPwSaving(true)
    setPwMsg(null)

    // Verify old password by re-authenticating
    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: oldPw,
    })
    if (reAuthErr) {
      setPwMsg({ text: "Current password is incorrect.", ok: false })
      setPwSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) {
      setPwMsg({ text: error.message, ok: false })
    } else {
      setPwMsg({ text: "Password updated.", ok: true })
      setOldPw(""); setNewPw(""); setConfirmPw("")
    }
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // ── Delete account ────────────────────────────────────────────────────────
  const deleteAccount = async () => {
    setDeleting(true)
    const res = await fetch("/api/auth/delete-account", { method: "DELETE" })
    if (!res.ok) {
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="acct-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="acct-modal" role="dialog" aria-modal aria-label="Account settings">
        {/* Header */}
        <div className="acct-header">
          <h2 className="acct-title">Account</h2>
          <button type="button" className="acct-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Profile ── */}
        <div className="acct-section">
          <p className="acct-section-title">Profile</p>

          <div className="acct-field">
            <label className="acct-label">Full Name</label>
            <input
              type="text"
              className="acct-input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              autoComplete="off"
            />
          </div>

          <div className="acct-field">
            <label className="acct-label">Email</label>
            <input
              type="email"
              className="acct-input acct-input--readonly"
              value={user.email ?? ""}
              readOnly
              tabIndex={-1}
            />
          </div>

          {profileMsg && (
            <p className={`acct-msg${profileMsg.ok ? " acct-msg--ok" : " acct-msg--err"}`}>
              {profileMsg.text}
            </p>
          )}

          <button
            type="button"
            className="acct-btn-save"
            onClick={saveProfile}
            disabled={profileSaving}
          >
            {profileSaving ? <span className="acct-spinner" /> : "Save Changes"}
          </button>
        </div>

        {/* ── Password ── */}
        {hasEmailAuth ? (
          <div className="acct-section">
            <p className="acct-section-title">Change Password</p>

            <div className="acct-field">
              <label className="acct-label">Current Password</label>
              <div className="acct-pw-wrap">
                <input
                  type={showOld ? "text" : "password"}
                  className="acct-input acct-input--pw"
                  value={oldPw}
                  onChange={e => setOldPw(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <button type="button" className="acct-pw-toggle" onClick={() => setShowOld(v => !v)}>
                  <EyeIcon open={showOld} />
                </button>
              </div>
            </div>

            <div className="acct-field">
              <label className="acct-label">New Password</label>
              <div className="acct-pw-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  className="acct-input acct-input--pw"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button type="button" className="acct-pw-toggle" onClick={() => setShowNew(v => !v)}>
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </div>

            <div className="acct-field">
              <label className="acct-label">Confirm New Password</label>
              <div className="acct-pw-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="acct-input acct-input--pw"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  onKeyDown={e => { if (e.key === "Enter") updatePassword() }}
                />
                <button type="button" className="acct-pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {pwMsg && (
              <p className={`acct-msg${pwMsg.ok ? " acct-msg--ok" : " acct-msg--err"}`}>
                {pwMsg.text}
              </p>
            )}

            <button
              type="button"
              className="acct-btn-save"
              onClick={updatePassword}
              disabled={pwSaving}
            >
              {pwSaving ? <span className="acct-spinner" /> : "Update Password"}
            </button>
          </div>
        ) : (
          <div className="acct-section">
            <p className="acct-section-title">Password</p>
            <p className="acct-oauth-note">
              You signed in with{" "}
              {user.identities?.map(i => i.provider).filter(p => p !== "email").join(" / ") || "an external provider"}.
              {" "}Password management is handled by that provider.
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="acct-section acct-section--actions">
          <button type="button" className="acct-btn-logout" onClick={signOut}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>

          {showDeleteConfirm ? (
            <div className="acct-delete-confirm">
              <p className="acct-delete-warning">
                This action is final and cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="acct-delete-btns">
                <button type="button" className="acct-btn-cancel" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                  Cancel
                </button>
                <button type="button" className="acct-btn-delete-final" onClick={deleteAccount} disabled={deleting}>
                  {deleting ? <span className="acct-spinner" /> : "Delete my account"}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="acct-btn-delete" onClick={() => setShowDeleteConfirm(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Delete account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
