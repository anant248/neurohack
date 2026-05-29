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

Bug fixes and polish applied after initial Phase 5 ship.

- [x] Fix Playwright E2E strict-mode violation — `getByText("Test Corp")` → `getByRole("heading", { name: "Test Corp" })`
- [x] Question dropdown: add `text-overflow: ellipsis` so long questions show `…`
- [x] Video capture area: increase `max-width` from 560 → 820px; scale up canvas placeholder
- [x] Story Bank modal: decouple list view from form view; tag filter chips; "New Story" button; back arrow
- [x] Interprep logo on all pages navigates to `/`
- [x] Global feedback bubble (bottom-right, all pages) → POSTs to `/api/submit-feedback` → `user_feedback` Supabase table
- [x] Debug + fix `user_feedback` Supabase GRANT issue
- [x] Auth consistency: `AuthButton` on all pages (landing, practice, technical)
- [x] `useAuth` guard: early-return when Supabase env vars absent (prevents E2E crash)
- [x] Technical page: replace `← Home` link with clickable Interprep logo + AuthButton
- [x] E2E test update: `"Home back link"` → `"Interprep logo navigates to /"`
- [x] Create `GET/POST /api/behavioral-bank` route
- [x] Create `PATCH/DELETE /api/behavioral-bank/[id]` route
- [x] Create `POST /api/prep-sessions` route (client sends local UUID)
- [x] Create `PATCH /api/prep-sessions/[id]/notes` route
- [x] Fix `usePrepSession` to include local UUID in POST body
- [x] Fix `SetupPanel` resume hydration race: make `resumeText` a controlled prop
- [x] Improve `/api/fetch-jd`: strip nav/header/footer/aside, prefer `<main>`/`<article>`, keyword-filter, collapse newlines
- [x] Replace sign-out button with floating FAB pill menu (avatar → Logout pill, drops down)
- [x] Eye icon SVG favicon replacing Vercel default
- [x] Supabase GRANTs documented

---

## Phase 6: Mobile Responsive Rewrite — TODO

Goal: make the app clean and fully functional on mobile. Not a separate app — the
same Next.js codebase, responsive via CSS. The user will define exactly which
features are included/excluded on mobile before implementation begins.

**Scope to be defined:**
- [ ] Which pages are mobile-accessible (landing, practice setup, full session, technical?)
- [ ] Which features are excluded on mobile (face tracking/webcam? code editor?)
- [ ] Navigation pattern on mobile (bottom tab bar? hamburger?)
- [ ] Touch targets, font sizes, spacing adjustments
- [ ] Practice page: stacked single-column layout vs two-column
- [ ] Technical page: read-only question view vs full editor on mobile

> ⚠️ Awaiting user input on mobile feature scope before implementation.

---

## Phase 7: Full Frontend UI Rewrite — TODO

Goal: replace the current generic purple-gradient aesthetic with a premium,
minimalist feel. Layout positions stay largely the same — this is a visual layer
rewrite using Framer Motion + shadcn/ui components.

**Scope to be defined:**
- [ ] Color scheme / palette (user will provide)
- [ ] Typography choices (user will provide)
- [ ] Specific animations and UI behaviours (user will provide)
- [ ] shadcn component mapping (which existing components get replaced)
- [ ] Framer Motion transition patterns (page transitions, card entrances, etc.)

> ⚠️ Awaiting user input on design direction, color scheme, and example UI references before implementation.

---

## Optional Later Features

Things that were originally planned for Phase 6–8 but are not on the critical path.
Pick these up after Phase 7 if time/priority allows.

- **User Dashboard**: session history timeline, streaks, score sparklines over time, "best session" card
- **Problem Picker** (`/technical`): search/filter beyond daily LeetCode — difficulty, topic tags, keyword
- **Onboarding flow**: guided empty-state for first-time users
- **Keyboard shortcuts**: Space to start/stop recording, etc.
- **PWA manifest + dark-mode meta tag**
