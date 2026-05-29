# Lessons — Interprep Revamp

Mistakes made and rules derived to prevent repeats.

---

## L-001 — Supabase TypeScript types need `Relationships: []`

**What happened**: Manual `database.types.ts` omitted the `Relationships` field
from table definitions. `@supabase/postgrest-js` `GenericTable` requires it.
Without it, `Database["public"]` doesn't satisfy `GenericSchema`, so every
`.from("table_name")` call returns `never[]` and TypeScript rejects all inserts.

**Rule**: When writing manual Supabase DB types, every table must have
`Relationships: []` (or a typed array of FK relationships). Run
`npx supabase gen types typescript` against a live project when possible.

---

## L-002 — Never disable ESLint rules that aren't in the config

**What happened**: Added `// eslint-disable-next-line @next/next/no-img-element`
in `AuthButton.tsx`. Our ESLint config doesn't include `eslint-config-next`, so
ESLint errored on the unknown rule being disabled. CI failed.

**Rule**: Only use `eslint-disable` comments for rules that are actually
configured. Check `eslint.config.mjs` before adding a disable comment.
If the rule isn't in config, the comment itself is an error.

---

## L-003 — AI prompts must not include data the model can't actually observe

**What happened**: Including the interview question in the Gemini feedback prompt
caused the model to infer and comment on the user's verbal answer — content it
can't hear. This made feedback feel fabricated and misleading.

**Rule**: Only pass observable data to AI prompts. If the model can't see/hear
something, don't include it. Add explicit "do NOT reference X" instructions as
a guardrail anyway.

---

## L-004 — CSS selectors must match the actual rendered DOM

**What happened**: Used `#webcam` selector for the video element, but the
`<video>` tag had no `id` attribute, so the rule silently never applied.
Video only filled part of its container.

**Rule**: After writing a CSS rule, verify the selector matches by checking
the actual JSX/HTML. Prefer class selectors (`.video-wrapper video`) over
IDs unless the ID is explicitly set.

---

## L-005 — Open redirects in OAuth callbacks

**What happened**: `/auth/callback` used `?next` param directly:
`${origin}${next}`. A `?next=//evil.com` value composes to a valid
browser redirect away from the app.

**Rule**: Always sanitise `next` / redirect params in OAuth callbacks.
Accept only values that start with `/` and do NOT start with `//`.
```typescript
const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
  ? rawNext : "/practice"
```

---

## L-006 — Surface URL error params in client components

**What happened**: `/auth/callback` redirected to `/auth?error=oauth_failed`
on failure, but `AuthForm` never read URL params, so OAuth failures showed a
blank form with no explanation to the user.

**Rule**: Any page that can receive error state via URL params must read them
on mount (`useEffect` with `window.location.search` or `useSearchParams`).
Test the error path explicitly.

---

## L-007 — Env var name mismatches cause silent production failures

**What happened**: Code checked `GEMINI_API_KEY` but Vercel had
`GOOGLE_GENERATIVE_AI_API_KEY` set. The route returned 503 in production with
no obvious error in logs.

**Rule**: When adding a new env var, document it in three places: `.env.local`
example, the API route that consumes it, and the Vercel/deployment setup guide.
Use a fallback chain when names are ambiguous:
`process.env.PREFERRED_NAME ?? process.env.LEGACY_NAME`.

---

## L-008 — CodeMirror custom keymaps must use `Prec.highest()` to override basicSetup

**What happened**: A custom keymap binding Tab to `acceptCompletion` was added
via the `extensions` array but appended after `basicSetup`. Because CodeMirror
resolves keymaps in order, `basicSetup`'s Tab→indent binding fired first and the
custom binding was never reached — Tab kept indenting instead of accepting
autocomplete suggestions.

**Rule**: Any custom keymap that must override a binding already provided by
`basicSetup` (Tab, Enter, Escape, etc.) must be wrapped in `Prec.highest()`:
```typescript
const myKeymap = Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }]))
```
`acceptCompletion` returns `false` when no completion popup is open, so it
safely falls through to the default handler in that case — no need to guard it.

---

## L-009 — Piston public API is blocked by Vercel serverless IPs; use vm for JS and Pyodide for Python

**What happened**: Run Test Cases returned 503 in production. The Piston API
(`emkc.org/api/v2/piston/execute`) blocks requests from Vercel's serverless
egress IPs, so Python execution always failed on deploy even though it worked
locally.

**Rule**: Never rely on Piston (or similar shared execution sandboxes) from a
Vercel API route.
- **JavaScript**: use Node.js `vm.runInNewContext` in the API route — no external
  service, no network, deterministic.
- **Python**: use Pyodide (WebAssembly) loaded client-side from the CDN. The
  harness result must be the last expression (not `print(...)`) so
  `pyodide.runPythonAsync()` can capture the return value directly.

---

## L-010 — Playwright strict mode: `getByText()` fails when multiple elements match

**What happened**: E2E test used `page.getByText("Test Corp")` which matched 3
elements (heading, company card body, company link). Playwright strict mode
throws when a locator resolves to more than one element.

**Rule**: Use `getByRole("heading", { name: "…" })` or scoped locators
(`.within()`) when text appears in multiple DOM places. `getByText()` is only
safe when the string is unique on the page. Always run E2E tests locally before
pushing.

---

## L-011 — Supabase tables need explicit GRANT after creation; auto-grant is not applied

**What happened**: `user_feedback` and `practice_sessions` tables were created
via the Supabase SQL Editor. Despite having an `INSERT` policy, writes failed
with `42501 permission denied`. The `service_role` and `authenticated` roles had
no `GRANT` on the table — Supabase SQL Editor doesn't auto-grant like the Table
Editor UI does.

**Rule**: After creating any table via raw SQL, always run:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
GRANT ALL ON public.<table> TO service_role;
```
Do this even when RLS policies exist — GRANTs and policies are separate layers.

---

## L-012 — `createBrowserClient("", "")` throws and crashes the React tree when env vars are absent

**What happened**: E2E tests run without Supabase env vars set. `AuthButton`
called `createClient()` → `createBrowserClient("", "")` which threw, unmounting
the entire React tree. Every page rendered blank in CI.

**Rule**: Guard any hook that calls Supabase with an early return when env vars
are absent:
```typescript
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  setLoading(false)
  return
}
```
Check for this in `useAuth` (and any hook that creates a Supabase client)
before the first `createClient()` call.

---

## L-013 — `useState(initialProp)` does not re-sync when the prop changes after mount

**What happened**: `SetupPanel` had `const [resumeText, setResumeText] = useState(initialResumeText)`.
`useResume` in the parent hydrates localStorage in a `useEffect`, so the prop
starts as `""` and updates to the saved value after mount. The `useState`
initialiser only runs once — `SetupPanel` never saw the update and the resume
textarea always appeared empty on return visits.

**Rule**: Don't use `useState(prop)` as a local copy of a parent-managed value
that may arrive late (e.g. after localStorage hydration). Either:
1. Make it a controlled component (`value={prop}`, `onChange → parent setter`), or
2. Sync with `useEffect(() => { if (prop && !localValue) setLocalValue(prop) }, [prop])`
   (but only when the prop-first-arrival pattern is safe to use).

---

## L-014 — API routes referenced in hooks must actually exist before shipping

**What happened**: `usePrepSession` called `POST /api/prep-sessions` and
`PATCH /api/prep-sessions/[id]/notes`, and `useBehavioralBank` called
`GET/POST /api/behavioral-bank` and `PATCH/DELETE /api/behavioral-bank/[id]`.
All four routes were 404 in production because the route files were never
created — only noted as future work. The hooks silently swallowed errors via
`.catch()` so no test caught this.

**Rule**: Before marking a feature complete, grep all `fetch("/api/…")` calls in
hooks and verify each route file exists. If a route is intentionally deferred,
wrap the call in a feature flag so it's never fired in production.

---

## L-017 — Page-level `site-shell { height: 100dvh }` must be overridden in mobile media queries

**What happened**: Both `/technical` and `/practice` set `.site-shell { height: 100dvh }` via their own
CSS files to bound the desktop "no-scroll" layout. The mobile `@media (max-width: 900px)` blocks reset
`body { overflow: auto }` but never reset `.site-shell { height: 100dvh }` or `.site-content { overflow: hidden }`.
Result: even though `body` could scroll, the site-shell acted as a 100dvh cage — content below the fold
was clipped and invisible. Question Selector, Session Notes, and question-body examples were all hidden.

**Rule**: Whenever a page-level CSS file overrides `.site-shell` or `.site-content` for a desktop
"fixed viewport" layout, the mobile media query MUST undo those overrides:
```css
@media (max-width: 900px) {
  body          { overflow: auto; height: auto; min-height: 100dvh; }
  .site-shell   { height: auto;   min-height: 100dvh; }
  .site-content { overflow: visible; }
}
```
Also reset `grid-template-rows: auto` (not `1fr`) and `flex: none` on all layout grids/flex
containers that previously used `flex: 1; overflow: hidden` — on mobile they must flow naturally.

---

## L-016 — `body { overflow: hidden }` requires a bounded height in the ancestor flex chain

**What happened**: After the Phase 7 UI revamp added a `site-shell` wrapper
(`min-height: 100dvh`, flex column) around all pages, the `/technical` and
`/practice` pages stopped showing their bottom content (buttons, problem end).
Both page CSS files set `body { overflow: hidden }` so that panels handle
scrolling internally — but `min-height` on `site-shell` is unbounded, so the
flex chain never got a real height cap. Page layouts with `flex: 1; overflow: hidden`
clipped content at the viewport edge with no way to scroll to it.

**Rule**: `overflow: hidden` on a flex child only clips correctly when every
ancestor in the chain has an explicit `height` (not just `min-height`). When
adding a full-page wrapper (`site-shell`, app shell, etc.) around pages that
use "no-scroll" layouts:
1. The wrapper must use `height: 100dvh` (not `min-height: 100dvh`) — or the
   page-level CSS must override it to `height: 100dvh; min-height: unset`.
2. `overflow: hidden` must be set on `site-content` (or equivalent) so the
   flex container itself clips at the viewport.

Fix applied in `technical/styles.css` and `practice/styles.css`:
```css
body { height: 100dvh; overflow: hidden; }
.site-shell { height: 100dvh; min-height: unset; }
.site-content { overflow: hidden; }
```

---

## L-015 — Client-generated UUID must be sent to the server when subsequent calls reference it

**What happened**: `usePrepSession` generated a local UUID (`newSession.id`) but
the `POST /api/prep-sessions` body didn't include it — the server would generate
a different UUID. The subsequent `PATCH /api/prep-sessions/${session.id}/notes`
used the local UUID, which didn't match any DB row, so notes never saved.

**Rule**: When a client generates an ID (e.g. `crypto.randomUUID()`) and later
makes follow-up API calls using that ID, always include the ID in the initial
POST body. The server schema should accept `id?: string` and pass it to the DB
insert (Postgres/Supabase accepts a client-supplied UUID for `gen_random_uuid()`
columns when provided).
