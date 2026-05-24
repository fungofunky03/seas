# Codex Prompts and Tasks

Use these prompts directly in Codex when continuing the project.

## Prompt 1 — Orient to the project

```text
You are working on the SEAS project: a static Vite/React SPA (deployed to Vercel) backed by Supabase (Postgres + RPC, called directly from the browser) for a permanent lighting installer software validation landing page and internal tools. The Express/SQLite code under server/ is legacy local-dev reference only and is not deployed. Read codex_handoff/00_READ_ME_FIRST.md through codex_handoff/06_INTERNAL_TOOLS_ROADMAP.md first. Do not make changes yet. Summarize the current architecture, product positioning, and the best next build.
```

## Prompt 2 — Build lead-review cockpit

```text
Build the first internal tool: a lead-review cockpit at /#/internal/leads. Requirements:

- Show raw waitlist rows in a table.
- Add search by name, email, company, bottleneck.
- Add filters for role, install volume, demo most-clicked step, status.
- Add a lead detail drawer/panel.
- Add fit score based on role, install volume, bottleneck keywords, and demo clicks.
- Add lead status: New, Reviewed, Contacted, Call Booked, Not Fit.
- Add internal notes.
- Add CSV export.
- Do not expose this from public navigation.
- Add Supabase schema/columns and RPCs (via migrations) as needed; raw rows must stay behind RLS, surfaced only through SECURITY DEFINER RPCs.
- Add real admin protection before exposing raw email/PII data. Because this is a static SPA with no server, gate it with Supabase Auth (authenticated role + RLS policy), not a client-side token. Do not put the service-role key in client code.
- Use existing design system, app chrome, Signal Red/Ink Black styling.
- Run npm run build and npx tsc --noEmit.
```

## Prompt 3 — Improve validation dashboard

```text
Improve /#/internal so it links to the new leads cockpit and shows:

- Total leads.
- New leads this week.
- Top role.
- Top install volume.
- Top demo step.
- Top bottleneck category.
- Conversion notes.
- Recommended next outreach segment.

Keep it aggregate-only and do not show raw PII on the summary dashboard.
```

## Prompt 4 — Add validation call tracker

```text
Add a validation call tracker connected to waitlist leads. A lead can have zero or more validation calls. Each call should track:

- scheduledAt
- status: Planned, Completed, No Show, Reschedule
- notes
- currentTools
- biggestPain
- mustHaveFeature
- willingnessToPay
- recommendedModule

Add Supabase schema/storage (tables + RLS + RPCs via migrations) and frontend views inside the internal area. Keep styling consistent.
```

## Prompt 5 — Build quote-to-crew MVP prototype

```text
Start the first actual SEAS internal/product module: Quote-to-Crew.

Build a protected internal route that lets Jay create a sample permanent lighting job:

- customer name
- address
- linear footage
- zones
- product/system
- controller location
- transformer count/wattage
- access/lift notes
- material notes
- labor estimate
- target margin

Then generate:

- quote summary
- crew job sheet
- install checklist
- service record stub

Persist jobs in Supabase (Postgres), behind RLS so they are not publicly readable. This is not public yet. It should feel like the real SEAS product.
```

## Prompt 6 — QA and cleanup

```text
Run a cleanup pass:

- Typecheck.
- Production build.
- Confirm no localStorage/sessionStorage/cookies.
- Confirm all buttons/inputs have data-testid.
- Check desktop and mobile layout.
- Review copy for overclaims.
- Confirm competitor names are phrased as ecosystem examples, not official integrations.
- Document any follow-up issues in codex_handoff/OPEN_ISSUES.md.
```

