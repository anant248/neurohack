import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

// ── POST /api/prep-sessions ───────────────────────────────────────────────────
// Saves a new prep session for the signed-in user.
// The client supplies its own UUID so the /[id]/notes PATCH can reference it.
const PostSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  jdText: z.string().max(20000).optional(),
  companyBlurb: z.string().max(2000).optional(),
  questionsJson: z.unknown().optional(),
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
      .from("prep_sessions")
      .insert({
        id: parsed.data.id,
        user_id: user.id,
        company_name: parsed.data.companyName,
        role: parsed.data.role,
        jd_text: parsed.data.jdText ?? null,
        company_blurb: parsed.data.companyBlurb ?? null,
        questions_json: parsed.data.questionsJson ?? null,
        notes: "",
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ session: data }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/prep-sessions]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
