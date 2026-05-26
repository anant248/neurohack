# Session Handoff — Interprep Revamp

**Branch**: `claude/stupefied-swartz-cf9ca6`
**Last commit**: Phase 3 — Interview Mode Selection
**CI status**: ✅ type-check clean, 47/47 unit tests passing, lint clean

---

## Goal

Evolve a hackathon face-tracking interview-prep app into a full platform.
Full 8-phase plan lives in `.claude/plans/this-is-an-app-playful-parasol.md`.

Phase 3 (Interview Mode Selection) is now **complete**.
The immediate next target is **Phase 4** (see below).

---

## Current State of the Code

### Route map
| Route | Status |
|-------|--------|
| `/` | ✅ Landing page — two mode cards (Behavioral + Technical) |
| `/practice` | ✅ Full — face tracking + AI feedback + history modal |
| `/technical` | ✅ LeetCode daily question + CodeMirror editor + optional webcam |
| `/facelandmarker` | ✅ 301 → `/practice` (backward compat) |
| `/auth` | ✅ Google + GitHub OAuth sign-in |
| `/auth/callback` | ✅ OAuth code exchange |
| `/api/feedback` | ✅ Gemini AI coaching |
| `/api/sessions` | ✅ GET + POST session history (Supabase-gated) |
| `/api/leetcode` | ✅ Server proxy for LeetCode GraphQL (1-hour ISR cache) |

### Key files added in Phase 3
```
src/app/page.tsx                  — Landing page (two mode cards)
src/app/page.css                  — Landing page styles
src/app/technical/page.tsx        — Technical interview page (client component)
src/app/technical/styles.css      — Technical page styles
src/app/api/leetcode/route.ts     — GET proxy → LeetCode GraphQL, s-maxage=3600
src/lib/leetcode.ts               — fetchDailyQuestion() + 3 fallback questions
tests/unit/lib/leetcode.test.ts   — 4 unit tests (happy path + 3 fallback triggers)
tests/unit/api/leetcode.test.ts   — 2 unit tests (status 200 + Cache-Control)
tests/e2e/landing.spec.ts         — 7 E2E tests for landing + 5 for /technical
```

### Design tokens (both new pages match practice page)
- Background: `linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)`
- Font: Inter
- Glass cards: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,0.1)`
- Primary accent: `#667eea` / `#764ba2`
- Technical accent: `#10b981` / `#059669`

### Dependencies added in Phase 3
```
@uiw/react-codemirror
@codemirror/lang-javascript
@codemirror/lang-python
```

### Env vars required (unchanged from Phase 2)
```
GOOGLE_GENERATIVE_AI_API_KEY      # Gemini — already set in Vercel
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_FEATURE_PERSISTENCE   # "true" to activate Phase 2 Supabase features
```

---

## Files Actively Being Edited

None — Phase 3 committed cleanly. Phase 4 not started.

---

## Everything Tried That Failed

*(Entries from Phase 1–2 preserved below for reference)*

| Attempt | What went wrong | Fix applied |
|---------|-----------------|-------------|
| `database.types.ts` without `Relationships: []` | `@supabase/postgrest-js` `GenericTable` requires `Relationships` field | Added `Relationships: []` to both table types |
| `// eslint-disable-next-line @next/next/no-img-element` in `AuthButton.tsx` | ESLint config doesn't include Next.js plugin — disable comment is itself an error | Removed the comment entirely |
| AI prompt included the question text | Gemini inferred verbal content | Removed `question` from `buildFeedbackPrompt()` |
| `#webcam` CSS selector | `<video>` had no `id="webcam"` | Changed to `.video-wrapper video` selector |
| `GEMINI_API_KEY` env var name | Vercel had `GOOGLE_GENERATIVE_AI_API_KEY` | Added fallback chain |
| Open redirect in `/auth/callback` | `?next=//evil.com` → cross-origin redirect | Sanitised: only accept paths starting `/` not `//` |
| `?error=oauth_failed` silently ignored | `AuthForm` never read URL params | Added `useEffect` in `AuthForm` |

---

## Next Step: Phase 4

Phase 4 per the plan: **AI Code Review on `/technical`**.

After the user writes code in the editor, add a "Get AI Feedback" button that sends
their code + the LeetCode problem statement to Gemini and shows structured feedback:
- Correctness (does the approach work?)
- Time/space complexity
- Style suggestions

**New files:**
1. `src/app/api/code-review/route.ts` — Gemini endpoint. Input: `{ code, language, problemTitle, problemContent }`. Output: `{ review: string }`. Zod-validated like `/api/feedback`.
2. `src/lib/codeReviewPrompt.ts` — `buildCodeReviewPrompt()`.
3. Updates to `src/app/technical/page.tsx` — "Get AI Feedback" button below editor, loading/result state.

**Tests:**
- Unit: `codeReviewPrompt.ts`
- Unit: `POST /api/code-review`
- E2E: stub the route, click button, see feedback panel

**Verification:**
- `npm run type-check && npm test` green
- `/technical` → write code → click button → see feedback
