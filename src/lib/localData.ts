/**
 * Browser-side persistence is namespaced under the "interprep-" prefix
 * (resume text, story bank, coffee chats, per-session notes, the technical
 * editor's code, and the data-owner marker). These helpers let auth flows wipe
 * that data so one user's content never leaks to the next on a shared browser.
 */

const APP_PREFIX = "interprep-"
const OWNER_KEY = "interprep-data-owner"

/**
 * Removes every Interprep app key from localStorage + sessionStorage. The
 * prefix sweep covers dynamic keys (e.g. `interprep-notes-…`, `interprep-tech-code-…`)
 * and deliberately leaves Supabase's own auth token (`sb-…`) untouched —
 * `supabase.auth.signOut()` owns that.
 */
export function clearLocalAppData(): void {
  if (typeof window === "undefined") return
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const keys: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(APP_PREFIX)) keys.push(key)
      }
      keys.forEach(k => storage.removeItem(k))
    } catch {
      // storage unavailable (SSR / private mode) — nothing to clear
    }
  }
}

/**
 * Ensures locally-cached data belongs to the current user. If the stored owner
 * differs from `userId` (e.g. a previous user who never signed out), the stale
 * data is wiped before the new user's data loads. No-op when logged out — the
 * sign-out handler clears data explicitly. Returns true if data was cleared.
 */
export function reconcileDataOwner(userId: string | null): boolean {
  if (typeof window === "undefined" || !userId) return false
  try {
    const stored = window.localStorage.getItem(OWNER_KEY)
    if (stored === userId) return false
    let cleared = false
    if (stored !== null) {
      clearLocalAppData() // also removes OWNER_KEY (it's interprep-prefixed)
      cleared = true
    }
    window.localStorage.setItem(OWNER_KEY, userId)
    return cleared
  } catch {
    return false
  }
}
