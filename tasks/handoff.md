# Session Handoff — Interprep Revamp

**Branch**: `revamp`  
**CI status**: ✅ type-check clean, lint clean  
**Vercel**: Deployed on `neurohack25.vercel.app` (production) — `revamp` branch auto-deploys

---

## Goals We're Working Towards

Evolve a hackathon face-tracking interview-prep app into a full interview prep platform.
Full plan lives in `tasks/todo.md`.

**Phases 1–7 complete.**

Phase 6 (mobile responsive) + Phase 7 (full UI rewrite) merged from `ui-changes` branch → `revamp` on 2026-05-30.
Phase 7 design: aurora background, emerald (#10b981) accent, premium glass cards, Inter font.

Next features planned (see bottom of this file for full spec):
1. "Practice without tailored questions" button on setup — general behavioural question bank
2. Nav bar modernisation (plain text buttons, hover → emerald, slightly taller bar)
3. 5-second countdown overlay before recording starts
4. FeedbackBubble repositioned above footer (no overlap)
5. Analysis-mode toggle above video frame (Eye Contact & Expression only vs Full Response scoring)

Optional / later:
- Full audio response scoring implementation (Phase 5.2)
- User dashboard (streaks, score history), problem picker for `/technical`, onboarding, PWA

---

## Current State of the Code

### Route map
| Route | Status |
|-------|--------|
| `/` | ✅ Landing — two mode cards (Behavioral + Technical) + AuthButton |
| `/practice` | ✅ Two-step flow: setup (resume + JD) → active session (company card, tailored questions, STAR hints, timer, notes, story bank) |
| `/technical` | ✅ Daily LeetCode + CodeMirror editor + run tests (JS/Python) + AI code review |
| `/auth` | ✅ Google + GitHub OAuth sign-in |
| `/auth/callback` | ✅ OAuth code exchange |
| `/api/feedback` | ✅ Gemini coaching — 3-section output (Visual Presence / STAR Tip / Key Focus) |
| `/api/behavioral-prep` | ✅ Resume + JD → company blurb + 8–10 tailored questions (Gemini JSON) |
| `/api/behavioral-bank` | ✅ GET (list entries) + POST (create) |
| `/api/behavioral-bank/[id]` | ✅ PATCH (update) + DELETE |
| `/api/prep-sessions` | ✅ POST (save session with client-supplied UUID) |
| `/api/prep-sessions/[id]/notes` | ✅ PATCH (update notes) |
| `/api/fetch-jd` | ✅ Server-side URL fetch → intelligent job-content extraction |
| `/api/submit-feedback` | ✅ POST → `user_feedback` Supabase table (service role, bypasses RLS) |
| `/api/sessions` | ✅ GET + POST recording history (practice_sessions table) |
| `/api/leetcode` | ✅ LeetCode GraphQL proxy (1-hour ISR cache) |
| `/api/run-code` | ✅ JS via Node vm; Python handled client-side via Pyodide |
| `/api/code-review` | ✅ Gemini code review |

### Key files
```
src/app/practice/page.tsx                          — Two-step practice page (setup → session)
src/app/practice/styles.css                        — All /practice styles
src/app/technical/page.tsx                         — Technical page
src/app/technical/styles.css                       — Technical styles
src/app/page.tsx                                   — Landing page
src/app/layout.tsx                                 — Root layout (FeedbackBubble injected here)
src/app/globals.css                                — Shared auth styles + feedback bubble styles

src/app/api/behavioral-prep/route.ts               — Gemini question generation
src/app/api/behavioral-bank/route.ts               — GET/POST story bank entries
src/app/api/behavioral-bank/[id]/route.ts          — PATCH/DELETE story bank entry
src/app/api/prep-sessions/route.ts                 — POST save prep session
src/app/api/prep-sessions/[id]/notes/route.ts      — PATCH session notes
src/app/api/fetch-jd/route.ts                      — JD URL fetch + extraction
src/app/api/submit-feedback/route.ts               — User feedback → Supabase

src/hooks/useResume.ts                             — Resume localStorage (controlled via SetupPanel prop)
src/hooks/usePrepSession.ts                        — Active session state + Supabase sync
src/hooks/useBehavioralBank.ts                     — STAR bank CRUD + localStorage/Supabase
src/hooks/useInterviewTimer.ts                     — Countdown timer
src/hooks/useAuth.ts                               — Auth state (guards against missing env vars)

src/components/auth/AuthButton.tsx                 — Floating FAB pill menu (avatar → Logout)
src/components/FeedbackBubble.tsx                  — Global feedback/bug/feature bubble
src/components/practice/SetupPanel.tsx             — Resume (controlled prop) + JD input
src/components/practice/BehavioralBankModal.tsx    — List/form view STAR bank modal
src/components/practice/QuestionSelector.tsx       — Category filter + STAR hints
src/components/practice/VideoCapture.tsx           — Timer overlay + camera error state
src/components/practice/ResultsCard.tsx            — Sectioned AI feedback display
src/components/practice/CompanyCard.tsx            — Company blurb + link
src/components/practice/SessionNotes.tsx           — Notes textarea + save

src/lib/types.ts                                   — All shared types
src/lib/database.types.ts                          — Supabase table types (all tables defined)
src/lib/flags.ts                                   — FLAGS.SUPABASE_PERSISTENCE gate
```

### Env vars required (all set in Vercel)
```
GOOGLE_GENERATIVE_AI_API_KEY      # Gemini
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         # Used by /api/submit-feedback (bypasses RLS)
NEXT_PUBLIC_FEATURE_PERSISTENCE   # "true" activates Supabase sync in hooks
```

### Supabase SQL GRANTs still needed (if not already applied)
```sql
-- Required for 42501 errors to go away:
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prep_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.behavioral_bank_entries TO authenticated;
GRANT ALL ON public.user_feedback TO service_role;

-- RLS policies (if not already created):
ALTER TABLE behavioral_bank_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own their bank entries"
  ON behavioral_bank_entries FOR ALL USING (auth.uid() = user_id);
```

### Design tokens (Phase 7 — current)
- Background: aurora-bg (animated, defined in globals.css) over `#060611` base
- Font: Inter (page CSS) + Geist Sans (root layout)
- Glass cards: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)`
- Primary accent: `#10b981` / `#059669` (emerald — all interactive elements)
- Landing hero: rotating word + floating animated shapes + frosted-glass mode cards

---

## Files Actively Being Edited

None — all work committed and pushed. No in-progress changes on the branch.

---

## Everything Tried That Failed

| Attempt | What went wrong | Fix applied |
|---------|-----------------|-------------|
| `database.types.ts` without `Relationships: []` | `@supabase/postgrest-js` requires the field; every `.from()` call returned `never[]` | Added `Relationships: []` to all table types |
| `// eslint-disable-next-line @next/next/no-img-element` | ESLint config doesn't include Next.js plugin — disabling an unknown rule is itself an error | Removed the comment |
| AI prompt included the LeetCode question text | Gemini inferred verbal content it can't hear | Removed `question` from `buildFeedbackPrompt()` |
| `#webcam` CSS selector | `<video>` had no `id="webcam"` | Changed to `.video-wrapper video` |
| `GEMINI_API_KEY` env var name | Vercel had `GOOGLE_GENERATIVE_AI_API_KEY` | Fallback chain: `process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY` |
| Open redirect in `/auth/callback` via `?next` param | `?next=//evil.com` composed to cross-origin redirect | Sanitised: only accept values starting `/` and not `//` |
| `?error=oauth_failed` silently ignored by `AuthForm` | Page never read URL search params | Added `useEffect` reading `window.location.search` on mount |
| `vi.stubEnv` leak between tests | Stub leaked into next test, flipping expected status | Added `afterEach(() => vi.unstubAllEnvs())` |
| CodeMirror Tab binding didn't fire | Custom keymap appended after `basicSetup`; `basicSetup`'s Tab→indent won | Wrapped with `Prec.highest()` |
| Python test runner via Piston API | `emkc.org` blocks Vercel serverless IPs; 503 in production | Replaced with client-side Pyodide (WebAssembly) |
| Pyodide harness used `print(__json.dumps(__results))` | `pyodide.runPythonAsync()` captures last expression, not stdout | Harness ends with bare `__json.dumps(__results)` expression |
| `page.getByText("Test Corp")` in Playwright | Matched 3 elements; strict mode throws | Changed to `page.getByRole("heading", { name: "Test Corp" })` |
| `user_feedback` table GRANT missing | Tables created via SQL Editor don't auto-grant `service_role`; all inserts returned 42501 | Ran `GRANT ALL ON user_feedback TO service_role` + enabled RLS + insert policy |
| `createBrowserClient("", "")` in E2E (no env vars) | Throws and unmounts entire React tree; all pages blank in CI | Added env var guard in `useAuth` before first `createClient()` call |
| `useState(initialResumeText)` in `SetupPanel` | Only runs at mount; localStorage hydrates after mount via `useEffect` in parent; component never saw the update; resume always appeared empty on return | Made `resumeText` a controlled prop — removed local state, pass value directly from `useResume()` |
| `POST /api/prep-sessions` didn't include client UUID | Server generated a different UUID; subsequent `PATCH /api/prep-sessions/${session.id}/notes` matched no row | Hook now sends `id: newSession.id` in POST body |
| `/api/behavioral-bank` and `/api/prep-sessions` routes were 404 | Hook files were written referencing routes that were never created | Created all four missing route files |
| JD URL extraction returned all page text (nav, sidebar, etc.) | `htmlToText()` stripped tags but kept all content | Strip `<nav>`/`<header>`/`<footer>`/`<aside>`, prefer `<main>`/`<article>`, keyword-filter long pages |
| Excessive newlines in JD fetch output | Block-element `\n` replacement + empty `<div>` closings created runs of blank lines | Collapse all `\n{2,}` → `\n` after extraction |

---

## Mobile Polish Pass (completed pre-Phase 6)

Five mobile issues fixed:
1. **White safe-area bars** — `html { background: #0f0c29 }` + `viewport-fit=cover` in layout.tsx
2. **Topbar nav overlap** — on ≤600px: hide "Interprep" text + icon-only history/bank buttons
3. **Code editor hidden on mobile** — removed `display:none` from `.editor-panel`; `editor-wrapper` gets `height: 360px` on mobile
4. **History stats stacking** — `.history-stats` changed from `auto-fit minmax(180px,1fr)` to `repeat(3, 1fr)`
5. **Footer** — new `src/components/Footer.tsx` with: logo, BMC link (`buymeacoffee.com/anantgoyal`), Facebook/X/copy-link share buttons, privacy note. Added to root layout.

## Next Features (planned, not yet implemented)

### 1 — Practice without tailored questions
- Button on setup page (below "Generate Tailored Questions"): `Practice without tailored questions →`
- Ghost/outline style matching "Continue without signing in"
- Skips company research entirely; goes straight to session with a hardcoded general behavioural question bank
- Company card is hidden in this mode; QuestionSelector uses the general bank

### 2 — Nav bar modernisation
- Remove bordered/bg buttons for Sign In, Story Bank, History
- Replace with plain white text, hover → `#10b981` (emerald), slight underline on hover
- Navbar height: increase to 72px
- Landing page tagline + feature bullets: bump font size ~10-15% for readability

### 3 — 5-second countdown before recording
- After user clicks "Start Recording", show a fullscreen-overlay countdown (5 → 4 → 3 → 2 → 1 → GO)
- Big numbers flashed on the video frame area
- Recording doesn't start until countdown completes
- User can cancel during countdown

### 4 — FeedbackBubble above footer
- Currently overlaps footer on mobile
- Fix: add `bottom: 80px` (or whatever footer height is) instead of `bottom: 20px`

### 5 — Analysis-mode toggle (above video frame)
- Two-option toggle: "Eye Contact & Expression" | "Full Response"
- Must be selected before Start Recording is enabled (alongside question selection)
- Option A (current): eye contact + expression scoring only
- Option B (future): audio + response scoring — for now just wire up the toggle UI; backend not implemented

**Verification**:
```bash
npm run type-check   # zero errors
npm test             # 105+ tests pass
npm run lint         # clean
```
