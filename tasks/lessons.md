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
