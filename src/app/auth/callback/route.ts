import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")

  // Sanitise the "next" param: must be a relative path starting with /
  // to prevent open-redirect attacks (e.g. next=//evil.com)
  const rawNext = searchParams.get("next") ?? "/practice"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/practice"

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code in URL — might be a hash-based recovery link (older Supabase flows).
  // Let the reset-password page handle it if next points there.
  if (next === "/auth/reset-password") {
    return NextResponse.redirect(`${origin}/auth/reset-password`)
  }

  // Exchange failed or no code — redirect to sign-in with error flag
  return NextResponse.redirect(`${origin}/auth?error=oauth_failed`)
}
