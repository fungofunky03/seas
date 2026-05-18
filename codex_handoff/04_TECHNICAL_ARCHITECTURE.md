# Technical Architecture

## Stack

- React 18
- TypeScript
- Vite
- Express
- Wouter hash routing
- TanStack Query
- React Hook Form
- Zod
- Drizzle ORM
- SQLite via `better-sqlite3`
- Tailwind CSS v3
- shadcn/ui components
- Lucide React icons

## Run commands

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

Typecheck:

```bash
npx tsc --noEmit
```

## Important files

- `client/src/pages/home.tsx` — main landing page and most product/demo sections.
- `client/src/pages/internal.tsx` — internal aggregate validation dashboard.
- `client/src/App.tsx` — Wouter routes.
- `client/src/index.css` — theme tokens, layout utilities, animations.
- `client/src/components/seas/Logo.tsx` — SEAS logo mark.
- `shared/schema.ts` — Drizzle schema and Zod insert schema.
- `server/storage.ts` — SQLite setup, migrations, storage methods.
- `server/routes.ts` — API endpoints.
- `server/index.ts` — Express server.
- `script/build.ts` — build pipeline.

## Routes

Frontend:

- `/#/` — landing page.
- `/#/internal` — internal validation dashboard.

Backend:

- `POST /api/waitlist`
- `GET /api/waitlist/count`
- `GET /api/waitlist/demo-interest`
- `GET /api/internal/validation-summary`

## Current database model

Table: `waitlist`

Fields:

- `id`
- `name`
- `email`
- `company`
- `role`
- `installVolume`
- `bottleneck`
- `demoLastStep`
- `demoMostClickedStep`
- `demoStepClicks`
- `createdAt`

## API behavior

Waitlist submissions are validated using `insertWaitlistSchema`. Demo engagement data is submitted with the waitlist form:

- last clicked demo step
- most clicked demo step
- click counts as JSON string

The internal dashboard currently uses aggregate endpoints only. It intentionally does not expose raw lead emails.

## Notes for Codex

- Keep `apiRequest` for backend calls. Do not use raw `fetch` in app code unless there is a deliberate reason.
- Preserve hash routing. Do not switch to path routing unless deployment supports it.
- Preserve sandbox compatibility: no localStorage/sessionStorage/cookies.
- If adding raw lead review tools, add authentication or at least an internal gate before exposing PII.

