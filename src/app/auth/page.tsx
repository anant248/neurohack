import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AuthForm } from "@/components/auth/AuthForm"
import "./styles.css"

export const metadata = { title: "Sign In — Interprep" }

export default async function AuthPage() {
  // If Supabase is configured, redirect already-signed-in users
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) redirect("/practice")
  }

  return <AuthForm />
}
