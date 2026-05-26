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

  // Exchange failed or no code — redirect to sign-in with error flag
  return NextResponse.redirect(`${origin}/auth?error=oauth_failed`)
}
