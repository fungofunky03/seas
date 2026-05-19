# Technical Architecture

## Stack

- React 18
- TypeScript
- Vite (static build, deployed to Vercel)
- Supabase (Postgres + RPC) as the runtime backend, called directly from the browser via `@supabase/supabase-js`
- Wouter hash routing
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS v3
- shadcn/ui components
- Lucide React icons

> Legacy: Express + Drizzle + SQLite source still lives under `server/` and is kept
> as a local-dev reference. Production no longer runs Node — the deployed app is a
> static SPA on Vercel that talks to Supabase from the client.

## Deployment

Primary target: **Vercel**.

- `vercel.json` points Vercel at `npm run vercel-build` (`vite build`) with output
  directory `dist/public`.
- Required Vercel env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
  (anon publishable key only — never the service-role key).
- Local dev: copy `.env.example` to `.env.local` and fill in the same vars.

GitHub Pages is static-only / legacy. If a Pages URL still exists, treat it as a
stale mirror; the canonical deployment is Vercel.

## Run commands

Frontend dev (recommended):

```bash
npm run dev:client
```

Legacy Express dev (kept for reference, not used in prod):

```bash
npm run dev
```

Static build (used by Vercel):

```bash
npm run build:client   # or: npm run vercel-build
```

Full legacy bundle (vite + esbuild server):

```bash
npm run build
```

Typecheck:

```bash
npx tsc --noEmit
```

## Important files

- `client/src/pages/home.tsx` — landing page; waitlist form writes directly to Supabase.
- `client/src/pages/internal.tsx` — internal aggregate validation dashboard; calls the `get_validation_summary` RPC.
- `client/src/lib/supabase.ts` — browser Supabase client.
- `client/src/App.tsx` — Wouter hash routes.
- `client/src/index.css` — theme tokens, layout utilities, animations.
- `client/src/components/seas/Logo.tsx` — SEAS logo mark.
- `shared/schema.ts` — Zod schema for waitlist submissions.
- `vercel.json` — Vercel build + SPA rewrite config.
- `server/` — legacy Express/SQLite reference (not deployed).

## Routes

Frontend:

- `/#/` — landing page.
- `/#/internal` — internal validation dashboard (aggregate-only).

Supabase surface (called from the browser):

- `from('waitlist').insert(...)` — anon-allowed insert per RLS.
- `rpc('get_waitlist_count')` — total waitlist count, integer.
- `rpc('get_validation_summary')` — JSON aggregate (`total`, `roleCounts`,
  `volumeCounts`, `bottleneckCounts`, `demoInterest`, `updatedAt`).

## Current database model

Table: `public.waitlist`

Columns: `id`, `name`, `email`, `company`, `role`, `install_volume`,
`bottleneck`, `demo_last_step`, `demo_most_clicked_step`, `demo_step_clicks`
(jsonb), `status`, `fit_score`, `internal_notes`, `created_at`, `updated_at`.

RLS: anon clients can `insert` only. Reads (count + summary) are exposed via
SECURITY DEFINER RPCs granted to `anon`. Raw rows are never exposed publicly.

## API behavior

Waitlist submissions are validated client-side using `insertWaitlistSchema` and
mapped from camelCase form fields to the snake_case Postgres columns before
insert. `demo_step_clicks` is sent as a JSON object (jsonb), not a string.

The internal dashboard remains aggregate-only — it does not query raw rows.

## Notes for Codex

- Do not expose raw lead rows publicly. If a lead-review cockpit is added,
  gate it behind real auth before showing PII.
- Do not hardcode the Supabase publishable key. Use Vite env vars.
- Do not use the Supabase service-role key in client code under any
  circumstance — that key bypasses RLS.
- Preserve hash routing. Do not switch to path routing unless deployment
  supports it (Vercel's SPA rewrite in `vercel.json` already does, but the
  app currently relies on `#/` routes).
- Preserve sandbox compatibility: no localStorage/sessionStorage/cookies.
