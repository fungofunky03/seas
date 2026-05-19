# QA, Deployment, and Handoff Checklist

## Before every handoff

Run:

```bash
npx tsc --noEmit
npm run build
```

Check:

- No TypeScript errors.
- Production build completes.
- No localStorage/sessionStorage/cookies.
- No fake testimonials.
- No false integration/partnership claims.
- Mobile layout still works.
- Sticky CTA does not cover important form fields.
- Waitlist form still submits.
- Internal dashboard still loads.

## Manual browser checks

Landing page:

- Hero CTA scrolls to waitlist.
- “How it works” scrolls correctly.
- “Automation” nav scrolls correctly.
- Interactive demo steps click and update.
- Waitlist success state appears after valid submit.

Internal:

- `/#/internal` loads.
- Aggregate stats render.
- Back-to-landing button works.

## Backend checks

Production backend is Supabase (no Node server is deployed). Verify via the
Supabase SQL editor or `psql`:

```sql
select get_waitlist_count();
select get_validation_summary();
```

Both RPCs are granted to `anon` and are called directly from the browser.

The legacy Express endpoints below still exist in `server/` for local-only
reference but are NOT part of the Vercel deployment:

```bash
curl http://localhost:5000/api/waitlist/count
curl http://localhost:5000/api/waitlist/demo-interest
curl http://localhost:5000/api/internal/validation-summary
```

## Deployment target

Production is deployed to **Vercel** as a static Vite build (`dist/public`) via
`vercel.json`. Required Vercel env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon publishable key only — never the
  service-role key)

GitHub Pages, if it still exists for this project, is a static legacy mirror.
Treat Vercel as the canonical deployment.

## Packaging instructions

For handoff to another coding environment:

1. Exclude `node_modules`.
2. Include `package.json` and `package-lock.json` if present.
3. Include `codex_handoff/`.
4. Include `data.db` if current local validation data is needed.
5. Include `dist/` only if the recipient needs the built artifact. Otherwise source is enough.

## Known warnings

The current production build may warn:

- PostCSS plugin missing `from` option.
- Large chunk warning over 500 kB.

These are warnings, not current blockers.

Future cleanup:

- Consider route-level code splitting once internal tools grow.
- Consider moving large page sections into separate components.
- Consider real auth before adding raw lead PII views.

