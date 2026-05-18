# Internal Tools Roadmap

The landing page is now strong enough for validation. The next phase is internal tools that help Jay act on validation leads and start shaping the real product.

## Tool 1 — Lead Review Cockpit

Priority: highest.

Goal:

Give Jay a private/internal way to review waitlist submissions, score fit, and decide who to contact.

Core features:

- Raw waitlist table.
- Search and filter by role, company, install volume, demo interest, bottleneck.
- Lead detail drawer.
- Fit score:
  - Dealer/Owner: high
  - Crew Lead: medium/high
  - Electrician: medium/high
  - Sales: medium
  - Other: low/unknown
  - Higher install volume = higher score
  - Bottleneck mentions quote/schedule/crew/service = higher score
  - Demo clicks indicate product interest
- Status:
  - New
  - Reviewed
  - Contacted
  - Call booked
  - Not fit
- Internal notes.
- CSV export.

Important:

- Add basic protection before exposing raw emails or PII.
- At minimum, use an environment variable admin token if full auth is not ready.

## Tool 2 — Validation Call Tracker

Goal:

Manage early-user interviews.

Core features:

- Create call record for a lead.
- Track scheduled date.
- Track interview status.
- Capture notes:
  - Current workflow
  - Current tools
  - Biggest pain
  - Must-have feature
  - Willingness to pay
  - Deal size/install volume
- Tag lead by recommended first module:
  - Quote
  - Schedule
  - Install documentation
  - Service/warranty

## Tool 3 — Feature Signal Board

Goal:

Turn user language into product priorities.

Core features:

- Aggregate bottleneck keywords.
- Manual tags.
- Top requested workflows.
- Quotes from interviews.
- Confidence score.

## Tool 4 — Quote-to-Crew MVP Prototype

Goal:

Build the first actual SEAS operational tool.

Recommended MVP:

- Create lead/job.
- Add roofline footage.
- Add channel count/zones.
- Add controller/transformer notes.
- Generate quote packet.
- Convert to crew job sheet.
- Attach install checklist.
- Mark service record created.

Why this first:

It is the clearest bridge between dealer owner pain and crew reality. It also matches the landing page promise and demo.

## Tool 5 — Public validation analytics

Goal:

Track landing-page performance.

Core features:

- Demo step click counts independent of signup.
- CTA click counts.
- Waitlist conversion rate.
- Section-level engagement.

Constraint:

Do not use cookies. Use server-side events or privacy-friendly event logs.

