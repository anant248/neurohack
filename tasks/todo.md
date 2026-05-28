# Interprep Revamp — Task Tracker

---

## Phase 5: Behavioral Page Overhaul — COMPLETE ✅

All items complete. 105/105 tests pass, type-check clean, lint clean.

### Review

Phase 5 delivered:
- Resume + JD input with URL fetch → AI-generated company card + 8–10 tailored questions
- Category filter + STAR hints on question selector
- 2-minute interview timer with 30s warning overlay
- Camera permission error → graceful degradation (no crash, informative message)
- Structured AI feedback: 3 sections (Visual Presence / STAR Tip / Key Focus)
- Session notes (localStorage-persisted)
- STAR Story Bank modal (add/edit/delete STAR stories, localStorage-persisted)
- 23 new tests added (10 timer, 8 QuestionSelector, 8 behavioral-prep API, prompts updated)

---

## Phase 5 Post-Launch Fixes — COMPLETE ✅

Bug fixes and polish applied after initial Phase 5 ship, across multiple sessions.

- [x] Fix Playwright E2E strict-mode violation — `getByText("Test Corp")` matched 3 elements → `getByRole("heading", { name: "Test Corp" })`
- [x] Question dropdown: add `text-overflow: ellipsis` so long questions show `…`
- [x] Video capture area: increase `max-width` from 560 → 820px; scale up canvas placeholder shapes + text
- [x] Story Bank modal: decouple list view from form view (`view: "list" | "form"` state); tag filter chips; "New Story" button; back arrow
- [x] Interprep logo on all pages navigates to `/`
- [x] Global feedback bubble (bottom-right, all pages) → POSTs to `/api/submit-feedback` → `user_feedback` Supabase table
- [x] Debug + fix `user_feedback` Supabase GRANT issue (service_role lacked permission)
- [x] Auth consistency: `AuthButton` on all pages (landing, practice, technical)
- [x] `useAuth` guard: early-return when Supabase env vars absent (prevents E2E crash)
- [x] Technical page: replace `← Home` link with clickable Interprep logo + AuthButton
- [x] E2E test update: `"Home back link"` → `"Interprep logo navigates to /"`
- [x] Create `GET/POST /api/behavioral-bank` route
- [x] Create `PATCH/DELETE /api/behavioral-bank/[id]` route
- [x] Create `POST /api/prep-sessions` route (client sends local UUID to sync with notes PATCH)
- [x] Create `PATCH /api/prep-sessions/[id]/notes` route
- [x] Fix `usePrepSession` to include local UUID in POST body
- [x] Fix `SetupPanel` resume hydration race: make `resumeText` a controlled prop
- [x] Improve `/api/fetch-jd`: strip nav/header/footer/aside, prefer `<main>`/`<article>`, keyword-filter long pages, collapse excessive newlines
- [x] Replace sign-out button with floating FAB pill menu (avatar trigger → Logout pill, drops down, click-outside closes)
- [x] Eye icon SVG favicon replacing Vercel default
- [x] Supabase GRANTs documented (user must run for `practice_sessions`, `prep_sessions`, `behavioral_bank_entries`)

---

## Phase 6: User Dashboard — TODO

- [ ] `/dashboard` route — session history timeline, attempt count, streak counter
- [ ] `useSessionHistory` already stores attempts; wire it to a proper dashboard page
- [ ] Streak logic: consecutive days with at least one session recorded
- [ ] Charts / sparklines for eye contact + expression score over time
- [ ] "Best session" highlight card
- [ ] Link from landing page and practice topbar

---

## Phase 7: Problem Picker — TODO

- [ ] `/technical` currently only shows the LeetCode daily problem
- [ ] Add search / filter UI: difficulty, topic tags, keyword search
- [ ] `/api/leetcode/search` endpoint — proxy LeetCode GraphQL `problemsetQuestionList`
- [ ] Save attempted problems to `practice_sessions` or a separate `technical_attempts` table

---

## Phase 8: Polish Pass — TODO

- [ ] Responsive / mobile layout (currently desktop-only)
- [ ] Onboarding flow for first-time users (empty state guidance)
- [ ] Page transition animations
- [ ] Keyboard shortcuts (e.g. Space to start/stop recording)
- [ ] Dark-mode meta tag + PWA manifest
