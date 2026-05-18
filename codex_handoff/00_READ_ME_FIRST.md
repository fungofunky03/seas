# SEAS Codex Handoff — Read Me First

This folder is the transfer packet for continuing the SEAS project in Codex. The project is a live validation landing page plus the beginning of an internal validation tooling layer for a permanent lighting installer software product.

## What SEAS is

SEAS is lighting installer software for permanent lighting dealers, install crews, and electricians expanding into permanent lighting. It is not a homeowner light-control app and it should not feel like a generic CRM. It should feel like a professional electrical operations system built from jobsite reality.

Core promise:

> Run permanent lighting jobs without the text-thread chaos.

Expanded promise:

> SEAS turns scattered leads, rough estimates, crew handoffs, and warranty callbacks into one dealer-ready workflow from quote to install to service.

## Current state

The project currently includes:

- A polished landing page for validation.
- A waitlist form backed by SQLite.
- Demo-step interest tracking.
- A self-contained interactive product demo.
- A done-for-you automation story animation.
- An internal aggregate validation dashboard at `/#/internal`.

## How to run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Typecheck:

```bash
npx tsc --noEmit
```

## Important constraints

- Do not use `localStorage`, `sessionStorage`, cookies, or IndexedDB. This app may run in sandboxed iframes.
- Use React state for transient UI state.
- Use backend API + SQLite for persistence.
- Routing uses Wouter with hash routes. Internal dashboard route is `/#/internal`.
- Do not claim partnerships or official integrations with Trimlight, JellyFish, Govee, Oelo, Celebright, EverLights, or similar systems unless actually verified.
- Keep copy validation-oriented. The product is in early validation, not fully launched.

## Best next build

Build the internal lead-review cockpit:

- Raw waitlist table.
- Fit score based on role, install volume, bottleneck, and demo interest.
- Lead detail drawer.
- Validation-call status.
- Notes field.
- Export CSV.
- Basic admin protection before exposing raw PII publicly.

