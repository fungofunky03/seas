# Design System and Animation Guide

## Visual direction

The SEAS landing page should feel like bold modern industrial field-tech. It should look polished and professional without becoming generic SaaS gradient design.

Core references:

- Electrical field tools
- Job sheets
- Industrial dashboards
- Blueprint grids
- Signal/hazard accents
- Dealer operations software

## Color system

Primary palette:

- Signal Red: `#E5251D`
- Ink Black: `#0B0B0C`
- White: `#FFFFFF`
- Off-white card surface
- Concrete/steel borders

Use red intentionally for:

- CTAs
- Active states
- Workflow lines
- Live status indicators
- Key headline emphasis

Do not overuse red as a decorative fill everywhere.

## Typography

Current CSS uses:

- Display: Archivo
- Body: Inter
- Mono: JetBrains Mono

Rules:

- Display headings are uppercase, heavy, and tight.
- Use mono labels for system/workflow metadata.
- Keep app/demo UI more compact than hero marketing text.
- Watch mobile headline wrapping carefully.

## Layout principles

- Strong section boundaries.
- Grid and panel-based layouts.
- Industrial separators.
- App chrome for product demo sections.
- Cards should feel like job records, not abstract SaaS cards.

## Animation principles

Animations should communicate workflow and automation, not just decoration.

Current animation types:

- Moving blueprint grid.
- Animated hazard stripe.
- Live status chips.
- Job-card scanline.
- Progress meters.
- Demo panel swaps.
- Workflow path animation.
- Automation nodes pulsing.
- Build logs cycling.
- CTA sheen and arrow movement.

Animation rules:

- Keep motion subtle and purposeful.
- Always support `prefers-reduced-motion`.
- Avoid large layout shifts.
- Avoid looping animations that distract from reading.
- Use red motion only where it implies signal, status, or workflow.

## Current major animated sections

### Hero job card

Shows a stylized permanent-lighting job record:

- Customer
- Linear footage
- Channel
- Crew
- Transformer
- Quote/margin/service stats
- Progress meters

### Done-for-you automation story

Shows owner pain becoming a behind-the-scenes automation workflow and then a simple owner-facing result.

### Interactive product demo

Four-step click-through flow:

- Quote
- Schedule
- Install
- Service

It uses app chrome, sidebar, job record header, pipeline tabs, metrics, checklist, and activity log.

