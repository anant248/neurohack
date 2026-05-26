# Session Handoff — Interprep Revamp

**Branch**: `claude/stupefied-swartz-cf9ca6`
**Last commit**: `f3696e8` — fix(lint): remove @next/next/no-img-element disable comment
**CI status**: ✅ Green (lint fix pushed, Vercel preview deployed)

---

## Goal

Evolve a hackathon face-tracking interview-prep app into a full platform.
Full 8-phase plan lives in `.claude/plans/this-is-an-app-playful-parasol.md`.

The immediate target is **Phase 3: Interview Mode Selection** — a real landing
page at `/` with two mode cards ("Behavioral Practice" → `/practice`,
"Technical Interview" → `/technical`), plus a `/technical` page that shows the
daily LeetCode question in a code editor with optional webcam.

---

## Current State of the Code

### What ships to `/practice` today
- MediaPipe FaceLandmarker tracks eye contact + expression in-browser (no server)
- Gemini Flash (`gemini-3.1-flash-lite`) gives AI coaching via `POST /api/feedback`
  — restricted to visual metrics only (no verbal content inferred)
- Session history in-memory; Supabase persistence behind `NEXT_PUBLIC_FEATURE_PERSISTENCE=true`
- Two-column no-scroll layout: question picker + feedback left, video right
- Google/GitHub OAuth via Supabase SSR (`/auth` page + `/auth/callback` route)

### Route map
| Route | Status |
|-------|--------|
| `/` | Stub — returns null, redirected by `next.config.ts` to `/practice` |
| `/practice` | ✅ Full — face tracking + AI feedback + history modal |
| `/facelandmarker` | ✅ 301 → `/practice` (backward compat) |
| `/auth` | ✅ Google + GitHub OAuth sign-in |
| `/auth/callback` | ✅ OAuth code exchange |
| `/api/feedback` | ✅ Gemini AI coaching |
| `/api/sessions` | ✅ GET + POST session history (Supabase-gated) |
| `/technical` | ❌ Not started |

### Key files
```
src/app/page.tsx                  — stub, replace with landing in Phase 3
src/app/practice/page.tsx         — orchestrates left (question+feedback) / right (video)
src/app/practice/styles.css       — all practice-page CSS, no Tailwind
src/app/auth/page.tsx             — server component, redirects signed-in users
src/app/auth/callback/route.ts    — OAuth callback, sanitised ?next param
src/app/api/feedback/route.ts     — Gemini endpoint (Zod-validated)
src/app/api/sessions/route.ts     — Supabase session CRUD (Zod-validated)
src/lib/faceLandmarker.ts         — typed wrapper around MediaPipe, no window.*
src/lib/prompts.ts                — buildFeedbackPrompt() — question intentionally excluded
src/lib/flags.ts                  — feature flags (SUPABASE_PERSISTENCE, AI_FEEDBACK)
src/lib/database.types.ts         — manual Supabase types; Relationships:[] required
src/middleware.ts                 — Supabase session refresh on every request
src/hooks/useFaceLandmarker.ts    — start/stop/results, calls /api/feedback after stop
src/hooks/useSessionHistory.ts    — in-memory OR Supabase depending on flag
src/hooks/useAuth.ts              — {user, loading} with onAuthStateChange
src/components/auth/AuthButton.tsx — topbar sign-in/out (flag-gated)
src/components/auth/AuthForm.tsx   — Google + GitHub buttons, reads ?error= from URL
supabase/migrations/…_initial_schema.sql — run this in Supabase SQL editor
```

### Env vars required (Vercel + .env.local)
```
GOOGLE_GENERATIVE_AI_API_KEY      # Gemini — already set in Vercel
NEXT_PUBLIC_SUPABASE_URL          # set after Supabase project is created
NEXT_PUBLIC_SUPABASE_ANON_KEY     # set after Supabase project is created
SUPABASE_SERVICE_ROLE_KEY         # set after Supabase project is created
NEXT_PUBLIC_FEATURE_PERSISTENCE   # set to "true" to activate Phase 2 features
```

User still needs to: create Supabase project, run migration SQL, configure
Google + GitHub OAuth providers, add URL allowlist, add env vars to Vercel,
flip `NEXT_PUBLIC_FEATURE_PERSISTENCE=true`.

---

## Files Actively Being Edited

None — session ended cleanly after Phase 2 commit. Phase 3 has not been
started. The next session starts with clean working tree on the worktree branch.

---

## Everything Tried That Failed

| Attempt | What went wrong | Fix applied |
|---------|-----------------|-------------|
| `database.types.ts` without `Relationships: []` | `@supabase/postgrest-js` `GenericTable` requires `Relationships` field; without it `Database["public"]` doesn't extend `GenericSchema`, making all `.from()` calls return `never[]` | Added `Relationships: []` to both table types |
| `// eslint-disable-next-line @next/next/no-img-element` in `AuthButton.tsx` | Our ESLint config doesn't include the Next.js plugin, so ESLint errors on an unknown rule being disabled | Removed the comment entirely — CI was failing on this |
| AI prompt included the question text | Gemini inferred/commented on what the user said even though it can't hear audio | Removed `question` from `buildFeedbackPrompt()`, added strict "do not reference the question topic" instruction |
| `#webcam` CSS selector for video | `<video>` had no `id="webcam"`, so the rule never applied and video only filled left portion of wrapper | Changed to `.video-wrapper video` selector with `position: absolute` overlay |
| `GEMINI_API_KEY` env var name in code | Vercel had `GOOGLE_GENERATIVE_AI_API_KEY` but code checked `GEMINI_API_KEY` → 503 in production | `process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY` fallback |
| Open redirect in `/auth/callback` | `?next=//evil.com` would compose to a valid cross-origin redirect | Sanitise: only accept `next` values that start with `/` and not `//` |
| `?error=oauth_failed` silently ignored | Callback route redirects there on failure but `AuthForm` never read URL params | Added `useEffect` in `AuthForm` that reads `window.location.search` on mount |

---

## Next Step: Phase 3

### Plan (enter plan mode at session start)

**New files to create:**

1. **`src/app/page.tsx`** — Replace the stub with a real landing page.
   Two mode cards side-by-side:
   - "Behavioral Practice" → `/practice` (eye contact + expression + AI coaching)
   - "Technical Interview" → `/technical` (daily LeetCode + code editor + optional webcam)
   Design: same dark purple gradient as practice page, glass-morphism cards,
   match the `practice/styles.css` token set (colors, border-radius, shadows).

2. **`src/app/page.css`** (or inline in a `landing/styles.css`) — landing page styles.

3. **`src/lib/leetcode.ts`** — Pure function that builds and fires the LeetCode
   GraphQL query. Returns a typed `LeetCodeQuestion` object. Fallback: 3
   hardcoded questions when the API is down.
   ```typescript
   export interface LeetCodeQuestion {
     title: string
     difficulty: "Easy" | "Medium" | "Hard"
     content: string          // HTML
     topicTags: string[]
     date: string
   }
   export async function fetchDailyQuestion(): Promise<LeetCodeQuestion>
   ```

4. **`src/app/api/leetcode/route.ts`** — Server proxy to avoid CORS. Calls
   LeetCode's GraphQL endpoint with `{ next: { revalidate: 3600 } }` (1-hour
   ISR cache). Returns the typed question JSON.
   GraphQL query:
   ```graphql
   { activeDailyCodingChallengeQuestion {
       date
       question { title difficulty content topicTags { name } }
   } }
   ```

5. **`src/app/technical/page.tsx`** — Technical interview page:
   - Left: question (rendered HTML from LeetCode), difficulty badge, topic tags
   - Right: CodeMirror editor (JS default, Python toggle), optional webcam strip
   - Mobile: question only (no editor, no webcam — too small)

6. **`src/app/technical/styles.css`** — page styles.

**Packages to install:**
```
@uiw/react-codemirror
@codemirror/lang-javascript
@codemirror/lang-python
```

**next.config.ts change:** Remove the `/ → /practice` redirect so the landing
page at `/` actually renders.

**Tests to add:**
- Unit: `src/lib/leetcode.ts` — mock fetch, verify fallback triggers on error
- Unit: `GET /api/leetcode` — mock leetcode.ts, verify 1-hour cache header
- E2E: landing page renders both mode cards; clicking "Technical Interview"
  navigates to `/technical`; `/technical` shows a question title

**Verification before marking done:**
- `npm run type-check && npm test` green
- `/` shows landing with both cards
- `/practice` still works (no regression)
- `/technical` loads daily question (or fallback) and renders CodeMirror

---

## CLAUDE.md Ground Rules (added this session)

- Enter **plan mode** for any 3+ step or architectural task
- After any user correction: update `tasks/lessons.md`
- Never mark done without running tests + verifying behavior
- Write plan to `tasks/todo.md` with checkable items before implementing
- Subagents for research/exploration to keep main context clean
- Simplicity first — minimal code impact per change
