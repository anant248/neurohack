import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

type CoffeeChatUpdate = Database["public"]["Tables"]["coffee_chats"]["Update"]

const QuestionSchema = z.object({
  id: z.string(),
  text: z.string().max(1000),
  notes: z.string().max(50000).default(""),
})

const TodoSchema = z.object({
  id: z.string(),
  text: z.string().max(500),
  done: z.boolean().default(false),
  aiGenerated: z.boolean().default(false),
})

const PatchSchema = z.object({
  personName: z.string().min(1).max(200).optional(),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  date: z.string().max(20).nullable().optional(),
  format: z.enum(["virtual", "in-person"]).optional(),
  questions: z.array(QuestionSchema).max(50).optional(),
  todos: z.array(TodoSchema).max(100).optional(),
  aiGenerationsUsed: z.number().int().min(0).max(10).optional(),
})

// ── PATCH /api/coffee-chats/[id] ──────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: "Persistence not configured" }, { status: 503 })
  }

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.format() }, { status: 400 })
  }

  const patch = parsed.data
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 })
  }

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbPatch: CoffeeChatUpdate = { updated_at: new Date().toISOString() }
    if (patch.personName !== undefined) dbPatch.person_name = patch.personName
    if (patch.company !== undefined) dbPatch.company = patch.company
    if (patch.role !== undefined) dbPatch.role = patch.role
    if (patch.date !== undefined) dbPatch.date = patch.date
    if (patch.format !== undefined) dbPatch.format = patch.format
    if (patch.questions !== undefined) dbPatch.questions = patch.questions
    if (patch.todos !== undefined) dbPatch.todos = patch.todos
    if (patch.aiGenerationsUsed !== undefined) dbPatch.ai_generations_used = patch.aiGenerationsUsed

    const { data, error } = await supabase
      .from("coffee_chats")
      .update(dbPatch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({ chat: data })
  } catch (error) {
    console.error("[PATCH /api/coffee-chats/[id]]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── DELETE /api/coffee-chats/[id] ─────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return new Response(null, { status: 204 })
  }

  const { id } = await params

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase
      .from("coffee_chats")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE /api/coffee-chats/[id]]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
