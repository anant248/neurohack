"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"

/**
 * Shown in the practice page topbar when SUPABASE_PERSISTENCE flag is on.
 * Renders a Sign In link or the signed-in user's avatar + Sign Out button.
 */
export function AuthButton() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return <div className="auth-btn-skeleton" aria-hidden />
  }

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
    <div className="topbar-user">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="topbar-avatar" referrerPolicy="no-referrer" />
      ) : (
        <div className="topbar-avatar-fallback">{initials}</div>
      )}
      <button onClick={signOut} className="topbar-signout-btn">
        Sign Out
      </button>
    </div>
  )
}
