import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

type CoffeeChatInsert = Database["public"]["Tables"]["coffee_chats"]["Insert"]

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

const ChatSchema = z.object({
  id: z.string().uuid().optional(),
  personName: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  role: z.string().max(200).default(""),
  date: z.string().max(20).optional(),
  format: z.enum(["virtual", "in-person"]).default("virtual"),
  questions: z.array(QuestionSchema).max(50).default([]),
  todos: z.array(TodoSchema).max(100).default([]),
  aiGenerationsUsed: z.number().int().min(0).max(10).default(0),
})

// ── GET /api/coffee-chats ─────────────────────────────────────────────────────
export async function GET(): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ chats: [] })
  }
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ chats: [], authenticated: false })

    const { data, error } = await supabase
      .from("coffee_chats")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100)

    if (error) throw error
    return Response.json({ chats: data ?? [], authenticated: true })
  } catch (error) {
    console.error("[GET /api/coffee-chats]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/coffee-chats ────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: "Persistence not configured" }, { status: 503 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = ChatSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.format() }, { status: 400 })
  }

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const insertRow: CoffeeChatInsert = {
      user_id: user.id,
      person_name: parsed.data.personName,
      company: parsed.data.company,
      role: parsed.data.role,
      date: parsed.data.date ?? null,
      format: parsed.data.format,
      questions: parsed.data.questions,
      todos: parsed.data.todos,
      ai_generations_used: parsed.data.aiGenerationsUsed,
      ...(parsed.data.id ? { id: parsed.data.id } : {}),
    }

    const { data, error } = await supabase
      .from("coffee_chats")
      .insert(insertRow)
      .select()
      .single()

    if (error) throw error
    return Response.json({ chat: data }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/coffee-chats]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
