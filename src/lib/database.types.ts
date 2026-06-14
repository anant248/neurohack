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
      prep_sessions: {
        Row: {
          id: string
          user_id: string
          company_name: string
          role: string
          jd_text: string | null
          company_blurb: string | null
          questions_json: unknown
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          role: string
          jd_text?: string | null
          company_blurb?: string | null
          questions_json?: unknown
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          role?: string
          jd_text?: string | null
          company_blurb?: string | null
          questions_json?: unknown
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      behavioral_bank_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          situation: string
          task: string
          action: string
          result: string
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          situation?: string
          task?: string
          action?: string
          result?: string
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          situation?: string
          task?: string
          action?: string
          result?: string
          tags?: string[]
          created_at?: string
        }
        Relationships: []
      }
      coffee_chats: {
        Row: {
          id: string
          user_id: string
          person_name: string
          company: string
          role: string
          date: string | null
          format: string
          questions: unknown
          todos: unknown
          ai_generations_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_name: string
          company?: string
          role?: string
          date?: string | null
          format?: string
          questions?: unknown
          todos?: unknown
          ai_generations_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_name?: string
          company?: string
          role?: string
          date?: string | null
          format?: string
          questions?: unknown
          todos?: unknown
          ai_generations_used?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          id: string
          type: string
          message: string
          page_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          message: string
          page_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          message?: string
          page_url?: string | null
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
