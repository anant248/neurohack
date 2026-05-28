# Session Handoff — Interprep Revamp

**Branch**: `claude/stupefied-swartz-cf9ca6`
**Last commit**: Phase 5 behavioral overhaul (uncommitted — run `git add -A && git commit`)
**CI status**: ✅ type-check clean, 105/105 unit tests passing, lint clean

---

## Goals

Evolve a hackathon face-tracking interview-prep app into a full platform.
Full 8-phase plan lives in `.claude/plans/this-is-an-app-playful-parasol.md`.

**Phases 1–5 are complete.** 

Remaining:
- Phase 6: User dashboard (session history, streaks)
- Phase 7: Problem picker (search / filter LeetCode problems beyond daily)
- Phase 8: Polish pass (animations, mobile layout, onboarding)

---

## Current State of the Code

### Route map
| Route | Status |
|-------|--------|
| `/` | ✅ Landing page — two mode cards (Behavioral + Technical) |
| `/practice` | ✅ Phase 5 overhaul — resume + JD input → tailored questions + STAR hints + timer + company card + STAR bank |
| `/technical` | ✅ Daily question + editor + Run Test Cases + AI review |
| `/facelandmarker` | ✅ 301 → `/practice` (backward compat) |
| `/auth` | ✅ Google + GitHub OAuth sign-in |
| `/auth/callback` | ✅ OAuth code exchange |
| `/api/feedback` | ✅ Gemini AI coaching — 3-section structured output (Visual Presence / STAR Tip / Key Focus) |
| `/api/behavioral-prep` | ✅ NEW — resume + JD → company blurb + 8–10 tailored questions (Gemini JSON) |
| `/api/fetch-jd` | ✅ NEW — server-side URL fetch + HTML-to-text proxy |
| `/api/sessions` | ✅ GET + POST session history (Supabase-gated) |
| `/api/leetcode` | ✅ Server proxy for LeetCode GraphQL (1-hour ISR cache) |
| `/api/run-code` | ✅ JS-only execution via Node.js vm |
| `/api/code-review` | ✅ Gemini code review (correctness / complexity / style) |

### Key files (active work lives here)

```
src/app/practice/page.tsx                       — Two-step practice page (setup → session)
src/app/practice/styles.css                     — All /practice styles (Phase 5 additions at bottom)
src/app/api/behavioral-prep/route.ts            — Gemini question generation
src/app/api/fetch-jd/route.ts                   — JD URL fetch proxy
src/app/api/feedback/route.ts                   — Gemini feedback (500 token limit)
src/lib/prompts.ts                              — buildFeedbackPrompt (3-section output)
src/lib/types.ts                                — TailoredQuestion, PrepSession, BehavioralBankEntry
src/hooks/useInterviewTimer.ts                  — Countdown timer hook
src/hooks/useResume.ts                          — Resume localStorage persistence
src/hooks/usePrepSession.ts                     — Active session state + Supabase sync
src/hooks/useBehavioralBank.ts                  — STAR bank CRUD + localStorage/Supabase
src/components/practice/SetupPanel.tsx          — Resume + JD input + generate button
src/components/practice/CompanyCard.tsx         — Company blurb + external link
src/components/practice/SessionNotes.tsx        — Notes textarea + save
src/components/practice/BehavioralBankModal.tsx — STAR story bank modal
src/components/practice/QuestionSelector.tsx    — Category filter + STAR hints
src/components/practice/ResultsCard.tsx         — Sectioned AI feedback display
src/components/practice/VideoCapture.tsx        — Timer overlay + camera error state
```

### How /technical works end-to-end

1. **On mount**: fetches `/api/leetcode` → LeetCode daily question with
   `title`, `titleSlug`, `difficulty`, `content` (HTML), `metaData` (JSON),
   `exampleTestcases` (newline-separated inputs), `topicTags`.
2. **Editor**: CodeMirror 6 with JS or Python syntax highlighting. Code is
   persisted per-language in `sessionStorage` (`interprep-tech-code-js` /
   `interprep-tech-code-py`). The editor opens with the method signature
   generated from `metaData` via `generateStarterCode()`.
3. **Run Test Cases (JS)**: POSTs `{ code, language: "js", exampleTestcases,
   metaData, content }` to `/api/run-code`. The route uses
   `vm.runInNewContext` with a 5-second timeout; no external service.
4. **Run Test Cases (Python)**: Loads Pyodide (~10 MB) from CDN
   (`cdn.jsdelivr.net/pyodide/v0.27.0/full/`) on first use, cached at module
   level. Calls `pyodide.runPythonAsync(harness)` where the harness ends with
   a bare `__json.dumps(__results)` expression so Pyodide captures the value.
   Zero server round-trips for Python execution.
5. **Get AI Feedback**: POSTs `{ code, language, problemTitle, problemContent }`
   to `/api/code-review` → Gemini returns structured review (≤200 words).

### Env vars required (all set in Vercel)
```
GOOGLE_GENERATIVE_AI_API_KEY      # Gemini — powers /api/feedback + /api/code-review
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_FEATURE_PERSISTENCE   # "true" to activate Phase 2 Supabase features
```

### Design tokens (consistent across all pages)
- Background: `linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)`
- Font: Inter
- Glass cards: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)`
- Primary accent: `#667eea` / `#764ba2`
- Technical accent: `#10b981` / `#059669`

---

## Files Actively Being Edited

None — all Pyodide work committed cleanly. No in-progress changes.

---

## Everything Tried That Failed

| Attempt | What went wrong | Fix applied |
|---------|-----------------|-------------|
| `database.types.ts` without `Relationships: []` | `@supabase/postgrest-js` requires the field; every `.from()` call returned `never[]` | Added `Relationships: []` to all table types |
| `// eslint-disable-next-line @next/next/no-img-element` | ESLint config doesn't include Next.js plugin — disabling an unknown rule is itself an error | Removed the comment |
| AI prompt included the LeetCode question text | Gemini inferred verbal content from a question it shouldn't have seen | Removed `question` from `buildFeedbackPrompt()` |
| `#webcam` CSS selector | `<video>` element had no `id="webcam"` attribute | Changed selector to `.video-wrapper video` |
| `GEMINI_API_KEY` env var name | Vercel had `GOOGLE_GENERATIVE_AI_API_KEY`; route silently returned 503 | Added fallback chain: `process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY` |
| Open redirect in `/auth/callback` via `?next` param | `?next=//evil.com` composed to a cross-origin redirect | Sanitised: only accept values starting `/` and not `//` |
| `?error=oauth_failed` silently ignored | `AuthForm` never read URL search params | Added `useEffect` that reads `window.location.search` on mount |
| `vi.stubEnv` leak between tests in `code-review.test.ts` | One test stubbed the API key to empty; the stub leaked into the next test, flipping its expected status code | Added `afterEach(() => vi.unstubAllEnvs())` and `vi.unstubAllEnvs()` in `beforeEach` |
| CodeMirror Tab binding didn't fire | Custom `keymap.of([{ key: "Tab", run: acceptCompletion }])` was appended after `basicSetup` in the extensions array; `basicSetup`'s Tab→indent fired first | Wrapped with `Prec.highest()` so the custom binding wins priority |
| Python test runner via Piston API | `emkc.org/api/v2/piston/execute` blocks Vercel serverless egress IPs; all Python runs returned 503 in production | Replaced with client-side Pyodide (WebAssembly); no server round-trip for Python |
| Piston harness used `print(__json.dumps(__results))` | `pyodide.runPythonAsync()` captures the last expression value, not stdout; `print()` returns `None` | `buildPyHarnessClient()` ends with bare `__json.dumps(__results)` expression |

---

## Supabase SQL to Apply

Before Phase 5 features work in production, run this SQL in the Supabase SQL editor:

```sql
create table prep_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  role text not null,
  jd_text text,
  company_blurb text,
  questions_json jsonb,
  notes text default '',
  created_at timestamptz default now()
);

create table behavioral_bank_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  situation text default '',
  task text default '',
  action text default '',
  result text default '',
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table prep_sessions enable row level security;
alter table behavioral_bank_entries enable row level security;
create policy "users own their prep sessions" on prep_sessions for all using (auth.uid() = user_id);
create policy "users own their bank entries" on behavioral_bank_entries for all using (auth.uid() = user_id);
```

The `usePrepSession` and `useBehavioralBank` hooks call placeholder API routes
(`/api/prep-sessions`, `/api/behavioral-bank`) that need to be built when enabling
`NEXT_PUBLIC_FEATURE_PERSISTENCE=true`. They work fine without Supabase in local mode.

## Next Step

Start **Phase 6: User dashboard** (session history, streaks).

The current `/practice` page exists but was built during the hackathon and is
rough. The goals:

1. **STAR-method prompt system** — show a structured prompt (Situation, Task,
   Action, Result) rather than a free-form question. Fetch or hardcode a bank
   of behavioural questions.
2. **Interview timer** — visible countdown (e.g. 2 minutes per answer) with a
   soft warning at 30 seconds.
3. **Remove webcam dependency for users who decline** — face tracking is
   interesting but optional; the page should be fully usable without camera
   permission. Degrade gracefully.
4. **Cleaner feedback display** — the Gemini response currently renders as
   plain text; add the same structured sections (Situation / Task / Action /
   Result quality, filler-word count, pacing) that the `/technical` AI review
   uses.

**Entry point**: `src/app/practice/page.tsx` (or wherever the behavioral page
lives — check `src/app/` for the exact path before editing).

**Verification checklist**:
```
npm run type-check   # must pass
npm test             # must pass (currently 82 tests)
npm run lint         # must pass
```
Then push to `claude/stupefied-swartz-cf9ca6` (or open a new worktree if the
work is large enough to warrant isolation).
