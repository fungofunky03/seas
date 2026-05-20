export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is SEAS for homeowners or for installers?",
    a: "SEAS is built for permanent lighting dealers, install crews, and electricians expanding into permanent lighting. It is not a consumer light-control app — it runs the business behind the lights.",
  },
  {
    q: "Does it work with Trimlight, JellyFish, Govee, Oelo, Celebright, or EverLights?",
    a: "SEAS is built for teams working around systems like those — quoting, installing, and servicing them in the field. We don't claim official integrations. The workflow is product-agnostic so you can run any line you carry.",
  },
  {
    q: "Who is building this?",
    a: "Jay Smith, a licensed electrician building from real field experience — crew handoffs, low-voltage runs, warranty callbacks, and the daily reality of running a dealer operation.",
  },
  {
    q: "What does the early access actually get me?",
    a: "A direct line to shape the product before launch. We're working with a small group of installer-operators to validate the workflow end-to-end. Early access is free during validation.",
  },
  {
    q: "When will it launch?",
    a: "We're in early validation now. The first dealer-ready release rolls out to the validation group first. Join the waitlist and we'll reach out when your slot opens.",
  },
  {
    q: "How is this different from a generic CRM?",
    a: "Generic CRMs don't know what a low-voltage transformer is, can't schedule a crew around a roofline measure, and won't tell you which jobs are due for a warranty re-check. SEAS is shaped around how permanent lighting jobs actually move.",
  },
];

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};
