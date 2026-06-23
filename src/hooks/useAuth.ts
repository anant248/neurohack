"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { reconcileDataOwner } from "@/lib/localData"

export interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Bail out gracefully when Supabase is not configured (e.g. E2E test env)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Hydrate from the locally-cached session (no network round-trip) so the
    // avatar/menu render instantly on every page. This is display-only; server
    // middleware and route handlers still validate the token for data access.
    supabase.auth.getSession().then(({ data }) => {
      reconcileDataOwner(data.session?.user?.id ?? null)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Keep in sync across tabs / OAuth redirects
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      reconcileDataOwner(session?.user?.id ?? null)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
