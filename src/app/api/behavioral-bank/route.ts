import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

// ── GET /api/behavioral-bank ──────────────────────────────────────────────────
// Returns the signed-in user's story bank entries, newest first.
// Returns an empty array when unauthenticated.
export async function GET(): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ entries: [] })
  }
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ entries: [], authenticated: false })
    }

    const { data, error } = await supabase
      .from("behavioral_bank_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error

    return Response.json({ entries: data ?? [], authenticated: true })
  } catch (error) {
    console.error("[GET /api/behavioral-bank]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/behavioral-bank ─────────────────────────────────────────────────
const PostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  situation: z.string().max(2000).default(""),
  task: z.string().max(2000).default(""),
  action: z.string().max(2000).default(""),
  result: z.string().max(2000).default(""),
  tags: z.array(z.string().max(50)).max(20).default([]),
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
      .from("behavioral_bank_entries")
      .insert({
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        user_id: user.id,
        title: parsed.data.title,
        situation: parsed.data.situation,
        task: parsed.data.task,
        action: parsed.data.action,
        result: parsed.data.result,
        tags: parsed.data.tags,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ entry: data }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/behavioral-bank]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
