import { type NextRequest } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

// ── PATCH /api/behavioral-bank/[id] ──────────────────────────────────────────
const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  situation: z.string().max(2000).optional(),
  task: z.string().max(2000).optional(),
  action: z.string().max(2000).optional(),
  result: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
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

  if (Object.keys(parsed.data).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 })
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
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", user.id) // RLS double-check: only own rows
      .select()
      .single()

    if (error) throw error
    if (!data) return Response.json({ error: "Not found" }, { status: 404 })

    return Response.json({ entry: data })
  } catch (error) {
    console.error("[PATCH /api/behavioral-bank/[id]]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── DELETE /api/behavioral-bank/[id] ─────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: "Persistence not configured" }, { status: 503 })
  }

  const { id } = await params

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("behavioral_bank_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id) // RLS double-check: only own rows

    if (error) throw error

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE /api/behavioral-bank/[id]]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
