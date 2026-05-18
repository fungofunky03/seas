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

Useful endpoints:

```bash
curl http://localhost:5000/api/waitlist/count
curl http://localhost:5000/api/waitlist/demo-interest
curl http://localhost:5000/api/internal/validation-summary
```

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

