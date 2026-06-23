import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

/** Browser-side Supabase client — safe to call in Client Components and hooks. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/**
 * Reads the locally-cached session (no network) to decide whether a remote
 * fetch is worth making. Lets data hooks skip their API call entirely for
 * signed-out/guest users — which would otherwise waste a round-trip plus the
 * middleware + route-handler getUser() calls.
 */
export async function hasActiveSession(): Promise<boolean> {
  try {
    const { data } = await createClient().auth.getSession()
    return !!data.session
  } catch {
    return false
  }
}
