# Raydiant

Raydiant is currently a Vite + React frontend for the SEAS validation landing page and internal prototype tools. Production uses a static Vercel deploy plus Supabase for persistence. A legacy Express + SQLite app still exists under `/home/runner/work/Raydiant/Raydiant/server` for reference and local comparison work.

## Current project state

- **Production path:** static frontend from `/home/runner/work/Raydiant/Raydiant/client` deployed with `vite build`
- **Data layer:** Supabase browser client plus shared payload schema in `/home/runner/work/Raydiant/Raydiant/shared/schema.ts`
- **Legacy/reference path:** Express + better-sqlite3 server in `/home/runner/work/Raydiant/Raydiant/server`
- **Primary product surfaces:** landing page, waitlist flow, internal dashboard, quote generator, house visualizer

## Repository layout

```text
/home/runner/work/Raydiant/Raydiant
├── client/src/features         # Feature-oriented frontend modules
│   ├── landing                 # Marketing/landing experience
│   ├── waitlist                # Waitlist types and Supabase access
│   ├── internal-dashboard      # Internal validation dashboard
│   ├── quote-generator         # Internal quote builder
│   └── visualizer              # House lighting visualizer
├── client/src/pages            # Thin route entry points only
├── client/src/components/ui    # Shared UI primitives
├── client/src/components/seas  # Branded shared components
├── shared                      # Shared schemas and cross-layer types
├── server                      # Legacy Express + SQLite reference app
└── docs                        # Architecture and contributor docs
```

## Commands

- `npm ci` — install dependencies
- `npm run dev` — active frontend development server
- `npm run check` — TypeScript validation
- `npm run build` — active production frontend build
- `npm run dev:legacy-app` — run the legacy Express + SQLite app
- `npm run build:legacy-app` — bundle the legacy full app for reference

## How to work in this repo

1. Add new product work under the matching folder in `/home/runner/work/Raydiant/Raydiant/client/src/features`.
2. Keep `/home/runner/work/Raydiant/Raydiant/client/src/pages` as route wrappers only.
3. Put shared payload contracts in `/home/runner/work/Raydiant/Raydiant/shared/schema.ts`.
4. Keep direct Supabase access in feature-local `api.ts` files instead of page components.
5. Treat `/home/runner/work/Raydiant/Raydiant/server` as legacy/reference code unless you intentionally need it.

See `/home/runner/work/Raydiant/Raydiant/docs/architecture.md` for the architecture decision and contributor guide.
