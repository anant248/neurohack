/**
 * Supabase database types.
 * Regenerate from your live project with:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts
 *
 * IMPORTANT: GenericTable (from @supabase/postgrest-js) requires a Relationships field.
 * Without it, Database["public"] does not extend GenericSchema and all .from() calls
 * lose their type information (falling back to never[]).
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          question: string
          eye_contact_score: number
          expression_score: number
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          eye_contact_score: number
          expression_score: number
          ai_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          eye_contact_score?: number
          expression_score?: number
          ai_feedback?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
