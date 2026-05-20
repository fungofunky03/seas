# Architecture overview

## Active production architecture

Raydiant currently ships as a static Vite frontend deployed to Vercel.

- **Frontend runtime:** React + Wouter in `/home/runner/work/Raydiant/Raydiant/client`
- **Persistence + aggregation:** Supabase RPCs and table writes from the browser client
- **Shared contracts:** `/home/runner/work/Raydiant/Raydiant/shared/schema.ts`
- **Deploy artifact:** `/home/runner/work/Raydiant/Raydiant/dist/public`

This is the path contributors should optimize for first.

## Legacy/reference architecture

The repository still contains an older Express + SQLite implementation under `/home/runner/work/Raydiant/Raydiant/server`.

- It mirrors waitlist and validation-summary behavior for local/reference use.
- It is **not** the primary production path.
- It is exposed in scripts as `dev:legacy-app`, `build:legacy-app`, and `start:legacy-app`.

Unless a task explicitly targets the legacy server, prefer changes in the frontend and Supabase-backed feature modules.

## Frontend organization rules

- `client/src/pages`: thin route entry files only
- `client/src/features/<feature>`: feature pages, domain helpers, and API access
- `client/src/components/ui`: reusable UI primitives
- `client/src/components/seas`: shared branded components
- `shared`: schemas and cross-layer types

## Naming conventions

- Use **kebab-case** for feature folders.
- Use **PascalCase** for React component files.
- Keep feature-specific data access in `api.ts`.
- Prefer shared contract reuse over redefining payload types in page files.

## Where to add new work

- **Landing/marketing content:** `client/src/features/landing`
- **Lead capture or waitlist logic:** `client/src/features/waitlist`
- **Internal dashboard:** `client/src/features/internal-dashboard`
- **Quote workflow:** `client/src/features/quote-generator`
- **Visualizer workflow:** `client/src/features/visualizer`

## Validation expectations

Before merging:

1. `npm run check`
2. `npm run build`

CI enforces the same baseline in `.github/workflows/ci.yml`.
