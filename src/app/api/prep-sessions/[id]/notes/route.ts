import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

// ── PATCH /api/prep-sessions/[id]/notes ──────────────────────────────────────
// Updates only the notes field on an existing prep session.
const PatchSchema = z.object({
  notes: z.string().max(10000),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: "Persistence not configured" }, { status: 503 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(body)
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
      .update({ notes: parsed.data.notes })
      .eq("id", id)
      .eq("user_id", user.id) // RLS double-check
      .select()
      .single()

    if (error) throw error
    if (!data) return Response.json({ error: "Not found" }, { status: 404 })

    return Response.json({ session: data })
  } catch (error) {
    console.error("[PATCH /api/prep-sessions/[id]/notes]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
