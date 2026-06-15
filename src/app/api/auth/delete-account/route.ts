import { type NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE(_req: NextRequest): Promise<Response> {
  try {
    // Identify the caller via their session cookie
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    // Delete via admin client (service role bypasses RLS)
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE /api/auth/delete-account]", error)
    return Response.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
