// Feature flags — deploy with a flag off, test, then enable via env var.
// All flags read from environment variables at build/runtime.
export const FLAGS = {
  SUPABASE_PERSISTENCE: process.env.NEXT_PUBLIC_FEATURE_PERSISTENCE === "true",
  AI_FEEDBACK: process.env.NEXT_PUBLIC_FEATURE_AI_FEEDBACK === "true",
} as const
