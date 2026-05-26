import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

// ── GET /api/sessions ─────────────────────────────────────────────────────────
// Returns the signed-in user's last 50 sessions, oldest first.
// Returns an empty array when called without a session (unauthenticated).
export async function GET(): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ sessions: [] })
  }
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ sessions: [] })
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50)

    if (error) throw error

    return Response.json({ sessions: data ?? [] })
  } catch (error) {
    console.error("[GET /api/sessions]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/sessions ────────────────────────────────────────────────────────
const PostSchema = z.object({
  question: z.string().min(1).max(500),
  eyeContactScore: z.number().int().min(0).max(100),
  expressionScore: z.number().int().min(0).max(100),
  aiFeedback: z.string().optional(),
})

export async function POST(req: NextRequest): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: "Persistence not configured" }, { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = PostSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.format() }, { status: 400 })
  }

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: user.id,
        question: parsed.data.question,
        eye_contact_score: parsed.data.eyeContactScore,
        expression_score: parsed.data.expressionScore,
        ai_feedback: parsed.data.aiFeedback ?? null,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ session: data }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/sessions]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
