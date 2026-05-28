import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ALLOWED_TYPES = ["feedback", "bug", "feature"] as const
type FeedbackType = (typeof ALLOWED_TYPES)[number]

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { type, message } = body as { type?: unknown; message?: unknown }

  if (!type || !ALLOWED_TYPES.includes(type as FeedbackType)) {
    return Response.json({ error: "Invalid type" }, { status: 400 })
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }
  if (message.length > 2000) {
    return Response.json({ error: "Message too long" }, { status: 400 })
  }

  // Try to persist to Supabase using the service role key (bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
      const { error } = await supabase.from("user_feedback").insert({
        type: type as FeedbackType,
        message: message.trim(),
        page_url: req.headers.get("referer") ?? null,
      })
      if (error) {
        console.error("[submit-feedback] insert failed:", JSON.stringify({
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        }))
        // Still return 200 — don't surface DB errors to the client
      }
    } catch (err) {
      console.error("[submit-feedback] unexpected error:", err instanceof Error ? err.message : String(err))
    }
  } else {
    console.log(`[Feedback] no Supabase config — type=${type} message="${message.trim()}"`)
  }

  return Response.json({ ok: true }, { status: 200 })
}
