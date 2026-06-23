import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Skip if Supabase is not configured (feature flag off / env vars absent)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to the request so downstream code sees fresh cookies
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          // Recreate the response with updated cookies in the Set-Cookie header
          response = NextResponse.next({ request: { headers: req.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session — must be awaited before any response is returned
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static assets. Media and
    // font extensions are excluded so they never trigger a network getUser() —
    // critical for video range-requests, which would otherwise fire an auth
    // call per chunk and stall playback.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mov|ogg|mp3|woff|woff2|ttf|otf)$).*)",
  ],
}
