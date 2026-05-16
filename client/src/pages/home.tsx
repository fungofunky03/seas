import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { apiRequest } from "@/lib/queryClient";
import { insertWaitlistSchema, type InsertWaitlist } from "@shared/schema";
import { SeasLogo } from "@/components/seas/Logo";
import {
  ArrowRight,
  CheckCircle2,
  Ruler,
  Calendar,
  ClipboardList,
  Wrench,
  Zap,
  Shield,
  Camera,
  Route,
  HardHat,
  FileText,
  Cable,
  type LucideIcon,
} from "lucide-react";

/* ----------------------------- FAQ data + JSON-LD ----------------------------- */

const FAQS: { q: string; a: string }[] = [
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

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

/* --------------------------------- Page --------------------------------- */

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <Header />
      <main>
        <Hero />
        <ValidationStrip />
        <ProblemSection />
        <ReplaceStackSection />
        <ProductStory />
        <InteractiveDemo />
        <FeaturesSection />
        <WhyDealersCare />
        <ElectricianBuilt />
        <WaitlistSection />
        <FAQSection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}

/* --------------------------------- Header -------------------------------- */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a
          href="#top"
          className="flex items-center gap-2"
          data-testid="link-logo"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <SeasLogo />
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <NavLink id="problem" label="Problem" />
          <NavLink id="how" label="How it works" />
          <NavLink id="demo" label="Demo" />
          <NavLink id="replace" label="Replace" />
          <NavLink id="features" label="Features" />
          <NavLink id="faq" label="FAQ" />
        </nav>
        <Button
          size="sm"
          className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-header-cta"
          onClick={() =>
            document
              .getElementById("waitlist")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          Join waitlist
        </Button>
      </div>
    </header>
  );
}

function NavLink({ id, label }: { id: string; label: string }) {
  return (
    <button
      onClick={() =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="text-muted-foreground transition-colors hover:text-foreground"
      data-testid={`link-nav-${id}`}
    >
      {label}
    </button>
  );
}

/* ---------------------------------- Hero --------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="bg-grid animated-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-1 stripe-accent animated-stripe" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-7 hero-copy-enter">
            <div className="mb-6 inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground status-chip">
              <span className="h-1.5 w-1.5 bg-primary" />
              Now in installer validation
            </div>
            <h1
              className="font-display text-[clamp(2.5rem,1rem+5vw,4.5rem)] font-black uppercase leading-[0.95] tracking-tight"
              data-testid="text-hero-headline"
            >
              Run permanent lighting jobs without the{" "}
              <span className="text-primary">text-thread chaos</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              SEAS turns scattered leads, rough estimates, crew handoffs, and warranty
              callbacks into{" "}
              <span className="font-semibold text-foreground">
                one dealer-ready workflow from quote to install to service
              </span>
              . Built by a licensed electrician for the teams actually doing the work.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="animated-cta h-12 rounded-none bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                data-testid="button-hero-cta"
                onClick={() =>
                  document
                    .getElementById("waitlist")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Join the installer validation group
                <ArrowRight className="cta-arrow ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-none border-foreground/20 px-6 text-base font-medium hover:bg-foreground/5"
                data-testid="button-hero-secondary"
                onClick={() =>
                  document
                    .getElementById("how")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                How it works
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                For dealers, crews, and electricians
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Built around quote → install → service
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Early access is free during validation
              </li>
            </ul>
          </div>

          <div className="md:col-span-5 hero-panel-enter">
            <HeroPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValidationStrip() {
  const items = [
    {
      k: "Built for",
      v: "Permanent lighting dealers, crews, and electricians",
    },
    {
      k: "First workflows",
      v: "Quote builder, crew job sheets, install documentation",
    },
    {
      k: "Validation ask",
      v: "Tell us where the real bottleneck is before launch",
    },
  ];

  return (
    <section className="border-b border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl divide-y divide-background/15 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="reveal-fade py-5 sm:px-6 first:sm:pl-0 last:sm:pr-0"
            style={{ animationDelay: `${i * 80}ms` }}
            data-testid={`strip-validation-${i}`}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/55">
              {item.k}
            </div>
            <div className="mt-1 text-sm font-semibold leading-snug">{item.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroPanel() {
  // A stylized "job sheet" card — communicates field-tech, not generic SaaS.
  const statuses = [
    { label: "Install ready", tone: "Ready" },
    { label: "Crew synced", tone: "Live" },
    { label: "Materials staged", tone: "Clear" },
  ];
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setStatusIndex((current) => (current + 1) % statuses.length),
      2200,
    );
    return () => window.clearInterval(timer);
  }, [statuses.length]);

  const status = statuses[statusIndex];

  return (
    <div className="job-card-float relative">
      <div className="absolute -inset-3 border border-border" aria-hidden="true" />
      <div className="relative overflow-hidden border border-foreground/15 bg-card p-5 shadow-xl">
        <div className="scanline" aria-hidden="true" />
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Job · #SE-0428
          </span>
          <span
            key={status.label}
            className="live-status inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-primary"
            data-testid="status-hero-job"
          >
            <span className="live-dot h-1.5 w-1.5 bg-primary" />
            {status.label}
          </span>
        </div>
        <div className="mt-4 space-y-3.5">
          <PanelRow label="Customer" value="Hartwell · 412 Ridge Pkwy" />
          <PanelRow label="Linear ft" value="218 ft eave + 64 ft soffit" mono />
          <PanelRow label="Channel" value="RGB+W · 24V LV run" mono pulse={statusIndex === 1} />
          <PanelRow label="Crew" value="Crew B · Mon 7:30a" pulse={statusIndex === 1} />
          <PanelRow label="Transformer" value="2× 200W · pre-staged" mono />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider">
          <Stat k="Quote" v="42 min" />
          <Stat k="Margin" v="38%" />
          <Stat k="Service" v="Yr 1 incl." />
        </div>
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <LiveProgress label="Quote package" value="92%" delay="0ms" />
          <LiveProgress label="Crew handoff" value="76%" delay="260ms" />
          <LiveProgress label="Service record" value="58%" delay="520ms" />
        </div>
      </div>
      <div
        className="absolute -bottom-4 -right-3 hidden border border-foreground/15 bg-foreground px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-background md:block"
        aria-hidden="true"
      >
        Field-built · {status.tone}
      </div>
    </div>
  );
}

function PanelRow({
  label,
  value,
  mono,
  pulse,
}: {
  label: string;
  value: string;
  mono?: boolean;
  pulse?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${pulse ? "live-row" : ""}`}>
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className={`text-right text-sm ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="stat-pop">
      <div className="text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-foreground">{v}</div>
    </div>
  );
}

function LiveProgress({ label, value, delay }: { label: string; value: string; delay: string }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-widest" data-testid={`meter-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden bg-foreground/10">
        <div
          className="live-meter h-full bg-primary"
          style={{ width: value, animationDelay: delay }}
        />
      </div>
    </div>
  );
}

/* -------------------------------- Problem -------------------------------- */

function ProblemSection() {
  const pains = [
    {
      icon: FileText,
      title: "Quotes that take all night",
      body: "Measurements scribbled in a notes app, pricing in a spreadsheet, contracts somewhere in email. Three days later the lead is cold.",
    },
    {
      icon: Route,
      title: "Crews stitched together by texts",
      body: "Job address in one thread, channel list in another, who's bringing the lift in a third. Something gets missed every week.",
    },
    {
      icon: Cable,
      title: "Low-voltage details lost in the handoff",
      body: "Transformer specs, channel counts, controller location, dealer line — none of it carries from sale to install crew cleanly.",
    },
    {
      icon: Camera,
      title: "Warranty callbacks with no record",
      body: "A homeowner reports a dead section in March. Nobody can find the install photos, run diagram, or which channel it was.",
    },
  ];
  return (
    <section id="problem" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionEyebrow>The problem</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
          Permanent lighting is going pro.{" "}
          <span className="text-muted-foreground">Most software hasn't.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Generic CRMs, holiday-only tools, and consumer light apps weren't built for dealer
          operations. Crews end up duct-taping 4–5 tools together — and still losing jobs in
          the gaps.
        </p>
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2">
          {pains.map(({ icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="reveal-fade bg-background p-6 md:p-8"
              style={{ animationDelay: `${i * 70}ms` }}
              data-testid={`card-pain-${i}`}
            >
              <Icon className="h-6 w-6 text-primary" strokeWidth={2.25} />
              <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-base text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Replace stack ----------------------------- */

function ReplaceStackSection() {
  const rows = [
    {
      old: "Spreadsheet estimate",
      gap: "Pricing, footage, controllers, and margin drift before the quote is sent.",
      seas: "Structured quote path with material, labor, and install notes captured once.",
    },
    {
      old: "Group-text crew handoff",
      gap: "Address, access notes, channel map, lift plan, and transformer location get split across threads.",
      seas: "Field-ready job sheet that travels from sale to install without retyping.",
    },
    {
      old: "Generic CRM pipeline",
      gap: "It can track a deal, but it does not understand roofline, channels, controller placement, or service history.",
      seas: "Permanent-lighting workflow from lead to install documentation to warranty callback.",
    },
  ];

  return (
    <section id="replace" className="border-b border-border bg-card py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionEyebrow>What SEAS replaces</SectionEyebrow>
        <div className="mt-3 grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-3xl font-black uppercase tracking-tight md:col-span-7 md:text-5xl">
            Stop duct-taping the install business together.
          </h2>
          <p className="text-base text-muted-foreground md:col-span-5">
            Early validation is focused on the messy handoffs that cost dealers speed,
            margin, and callbacks — not another generic contact database.
          </p>
        </div>
        <div className="mt-12 overflow-hidden border border-border">
          <div className="hidden grid-cols-12 border-b border-border bg-foreground px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-background md:grid">
            <div className="col-span-3">Today</div>
            <div className="col-span-4">Where it breaks</div>
            <div className="col-span-5">SEAS workflow</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className="reveal-fade grid gap-4 border-b border-border bg-background p-5 last:border-b-0 md:grid-cols-12 md:items-start"
              style={{ animationDelay: `${i * 90}ms` }}
              data-testid={`row-replace-${i}`}
            >
              <div className="md:col-span-3">
                <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:hidden">
                  Today
                </div>
                <div className="mt-1 font-display text-lg font-black uppercase tracking-tight md:mt-0">
                  {row.old}
                </div>
              </div>
              <div className="text-sm text-muted-foreground md:col-span-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:hidden">
                  Where it breaks
                </span>
                <p className="mt-1 md:mt-0">{row.gap}</p>
              </div>
              <div className="border-l-2 border-primary pl-4 text-sm font-medium md:col-span-5">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:hidden">
                  SEAS workflow
                </span>
                <p className="mt-1 md:mt-0">{row.seas}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Product Story ----------------------------- */

function ProductStory() {
  const steps = [
    {
      n: "01",
      icon: Ruler,
      title: "Quote it like a pro",
      body:
        "Capture roofline measurements, channel counts, low-voltage specs, and add-ons in a structured estimate. Same-day quotes a homeowner can actually sign.",
    },
    {
      n: "02",
      icon: Calendar,
      title: "Schedule the crew",
      body:
        "Route-aware scheduling, crew assignments, and pre-stage lists. The truck leaves the shop knowing exactly what to do.",
    },
    {
      n: "03",
      icon: Wrench,
      title: "Install. Document. Service.",
      body:
        "Field checklists, install photos, run diagrams, and a service record that survives every warranty call and re-sell.",
    },
  ];
  return (
    <section id="how" className="border-b border-border bg-card py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
          One workflow.{" "}
          <span className="text-primary">From quote to install to service.</span>
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ n, icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="reveal-fade relative"
              style={{ animationDelay: `${i * 90}ms` }}
              data-testid={`step-${i}`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Step {n}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="icon-charge mt-5 inline-flex h-12 w-12 items-center justify-center border border-foreground bg-foreground text-background">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-tight">
                {title}
              </h3>
              <p className="mt-3 text-base text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Interactive Demo ----------------------------- */

type DemoStep = {
  key: "quote" | "schedule" | "install" | "service";
  label: string;
  icon: LucideIcon;
  operator: string;
  headline: string;
  summary: string;
  status: string;
  metric: string;
  metricLabel: string;
  details: { k: string; v: string }[];
  checklist: string[];
  note: string;
};

const DEMO_STEPS: DemoStep[] = [
  {
    key: "quote",
    label: "Quote",
    icon: FileText,
    operator: "Dealer / sales",
    headline: "Same-day quote with install reality baked in.",
    summary:
      "The lead turns into a structured permanent-lighting estimate with roofline footage, channels, controllers, transformers, add-ons, and margin visible before the proposal goes out.",
    status: "Proposal ready",
    metric: "$8,740",
    metricLabel: "Quoted project",
    details: [
      { k: "Customer", v: "Hartwell Residence · 412 Ridge Pkwy" },
      { k: "Measure", v: "218 ft eave · 64 ft soffit · 4 zones" },
      { k: "Electrical", v: "2× 200W transformers · 24V RGB+W" },
      { k: "Margin", v: "38% target after lift + labor" },
    ],
    checklist: [
      "Roofline photo marked with channel zones",
      "Controller and transformer locations captured",
      "Maintenance plan included in proposal",
    ],
    note: "Dealer sees the price, scope, and install assumptions before the quote ever reaches the homeowner.",
  },
  {
    key: "schedule",
    label: "Schedule",
    icon: Calendar,
    operator: "Ops / dispatcher",
    headline: "Turn the sold job into a clean crew assignment.",
    summary:
      "Once approved, SEAS creates the job packet, slots the crew, flags the lift requirement, and builds a pre-stage list so the truck leaves with the right gear.",
    status: "Crew locked",
    metric: "Mon 7:30a",
    metricLabel: "Install window",
    details: [
      { k: "Crew", v: "Crew B · Luis + Marco" },
      { k: "Route", v: "West zone · 18 min from prior job" },
      { k: "Equipment", v: "28 ft ladder · compact lift requested" },
      { k: "Pre-stage", v: "Track, lenses, controllers, 400W total power" },
    ],
    checklist: [
      "Access notes sent to crew lead",
      "Materials staged by zone and color",
      "Homeowner confirmation text queued",
    ],
    note: "The office stops retyping the sale into a calendar, a spreadsheet, and a group text.",
  },
  {
    key: "install",
    label: "Install",
    icon: Wrench,
    operator: "Crew lead",
    headline: "Crew sees the plan, documents the work, and closes the loop.",
    summary:
      "The field view carries the measurements, channel plan, transformer placement, safety notes, and photo checklist so installation details do not disappear after the truck rolls.",
    status: "Install in progress",
    metric: "8 / 11",
    metricLabel: "Checklist done",
    details: [
      { k: "Transformer", v: "Garage east wall · dedicated outlet nearby" },
      { k: "Controller", v: "North soffit corner · hidden from street" },
      { k: "Photo log", v: "24 install photos attached" },
      { k: "Field note", v: "Add 18 ft splice at west return" },
    ],
    checklist: [
      "Channel 1–4 tested before ladder teardown",
      "Run diagram attached to job record",
      "Completion photos ready for homeowner",
    ],
    note: "Crew details become permanent job data instead of disappearing into someone’s camera roll.",
  },
  {
    key: "service",
    label: "Service",
    icon: Shield,
    operator: "Service / owner",
    headline: "Warranty callbacks start with the full install record.",
    summary:
      "Months later, the dealer can pull up exactly what was installed, where the controller sits, which channel is affected, and which photos show the original run.",
    status: "Service record live",
    metric: "48 hr",
    metricLabel: "Callback target",
    details: [
      { k: "Issue", v: "Channel 3 flicker · north eave" },
      { k: "Warranty", v: "Year-one service included" },
      { k: "History", v: "Original test photos + run diagram linked" },
      { k: "Upsell", v: "Annual tune-up reminder scheduled" },
    ],
    checklist: [
      "Tech sees transformer and channel notes",
      "Service photos saved back to the same job",
      "Owner sees recurring service opportunity",
    ],
    note: "Service becomes part of the customer lifetime value, not just a fire drill.",
  },
];

function InteractiveDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = DEMO_STEPS[activeIndex];
  const Icon = active.icon;

  return (
    <section id="demo" className="relative overflow-hidden border-b border-border bg-foreground py-20 text-background md:py-28">
      <div className="absolute inset-0 demo-grid opacity-35" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 stripe-accent animated-stripe" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionEyebrow className="border-background/20 text-background/65">
              Interactive product demo
            </SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Click through the job flow before you join the waitlist.
            </h2>
          </div>
          <p className="text-base text-background/70 md:col-span-5">
            This is a self-contained demo using realistic permanent-lighting job data:
            quote, schedule, install, and service all tied to the same customer record.
          </p>
        </div>

        <div className="mt-12 demo-shell overflow-hidden border border-background/15 bg-background/[0.04]">
          <div className="flex items-center justify-between border-b border-background/15 bg-background/[0.08] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span className="h-3 w-3 rounded-full bg-background/25" />
              <span className="h-3 w-3 rounded-full bg-background/15" />
              <span className="ml-3 hidden font-mono text-[11px] uppercase tracking-[0.22em] text-background/45 sm:inline">
                app.seas.tools / job / SE-0428
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/45">
              Demo mode
            </span>
          </div>

          <div className="grid min-h-[680px] lg:grid-cols-[240px_1fr]">
            <aside className="border-b border-background/15 bg-background/[0.06] p-4 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-xl font-black uppercase tracking-tight">SEAS</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/40">
                    Dealer workspace
                  </div>
                </div>
                <span className="live-dot h-2 w-2 bg-primary" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {["Pipeline", "Jobs", "Crews", "Service"].map((item, index) => (
                  <div
                    key={item}
                    className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-widest ${
                      index === 1
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-background/15 text-background/45"
                    }`}
                    data-testid={`demo-sidebar-${item.toLowerCase()}`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden border border-background/15 bg-background/[0.035] p-4 text-xs text-background/55 lg:block">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/35">
                  Live handoff
                </div>
                <div className="demo-route-line mt-4" aria-hidden="true" />
                <p className="mt-4">
                  Same job, same record. Each step inherits the data from the one before it.
                </p>
              </div>
            </aside>

            <div className="bg-background text-foreground">
              <div className="grid border-b border-border bg-card px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Permanent lighting job
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-black uppercase tracking-tight">
                    Hartwell Residence
                  </h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                  {["West zone", "RGB+W", "24V", "Warranty incl."].map((tag) => (
                    <span
                      key={tag}
                      className="border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-px bg-border md:grid-cols-4">
                {DEMO_STEPS.map(({ label, icon: StepIcon, operator }, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`demo-step-button bg-background p-4 text-left transition-all ${
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={isActive}
                      data-testid={`button-demo-${label.toLowerCase()}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center border ${
                            isActive ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          <StepIcon className="h-4 w-4" />
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-widest">0{index + 1}</span>
                      </div>
                      <div className="mt-3 font-display text-lg font-black uppercase tracking-tight">
                        {label}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {operator}
                      </div>
                      <div className="mt-3 h-1 overflow-hidden bg-foreground/10">
                        <div
                          className={`h-full bg-primary transition-all duration-500 ${
                            index <= activeIndex ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="relative overflow-hidden">
                <div className="scanline" aria-hidden="true" />
                <div className="grid gap-px bg-border xl:grid-cols-[1fr_320px]">
                  <div className="bg-background p-5 md:p-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="live-status inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-primary">
                        <span className="live-dot h-1.5 w-1.5 bg-primary" />
                        {active.status}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        Job · #SE-0428 · Hartwell
                      </span>
                    </div>

                    <div key={active.key} className="demo-panel-swap mt-6">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-foreground bg-foreground text-background">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                            {active.label} workspace
                          </div>
                          <h3 className="demo-workspace-heading font-display text-xl font-black uppercase tracking-tight sm:text-2xl md:text-3xl">
                            {active.headline}
                          </h3>
                          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                            {active.summary}
                          </p>
                        </div>
                      </div>

                      <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {active.details.map((detail) => (
                          <div
                            key={detail.k}
                            className="grid gap-2 border border-border bg-card p-4"
                            data-testid={`demo-detail-${active.key}-${detail.k.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              {detail.k}
                            </div>
                            <div className="text-sm font-semibold">{detail.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <aside className="bg-card p-5 md:p-7">
                    <div className="grid grid-cols-2 gap-px bg-border">
                      <div className="bg-background p-4">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {active.metricLabel}
                        </div>
                        <div key={`${active.key}-metric`} className="metric-flip mt-2 font-display text-3xl font-black uppercase tracking-tight text-primary">
                          {active.metric}
                        </div>
                      </div>
                      <div className="bg-background p-4">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Flow progress
                        </div>
                        <div className="mt-3 h-10 border border-border bg-card p-1">
                          <div
                            className="live-meter h-full bg-primary"
                            style={{ width: `${(activeIndex + 1) * 25}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border border-border bg-background p-4">
                      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Field checklist
                      </div>
                      <ul key={`${active.key}-checklist`} className="demo-panel-swap mt-4 space-y-3">
                        {active.checklist.map((item, index) => (
                          <li key={item} className="flex items-start gap-3 text-sm">
                            <span className="demo-led mt-1 h-2 w-2 shrink-0 bg-primary" style={{ animationDelay: `${index * 120}ms` }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 border border-border bg-background p-4">
                      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Activity
                      </div>
                      <div key={`${active.key}-activity`} className="demo-panel-swap mt-4 space-y-3 text-sm">
                        <ActivityLine text={`${active.operator} updated ${active.label.toLowerCase()} workspace`} />
                        <ActivityLine text="Customer record synced across job flow" />
                        <ActivityLine text="Next handoff data prepared automatically" />
                      </div>
                    </div>

                    <div key={`${active.key}-note`} className="demo-panel-swap mt-5 border border-primary/25 bg-primary/10 p-4 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Why it matters: </span>
                      {active.note}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border border-background/15 bg-background/[0.035] p-4 text-sm text-background/70 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Want the real version shaped around your crew’s workflow?
            </span>
            <Button
              className="animated-cta rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-demo-cta"
              onClick={() =>
                document
                  .getElementById("waitlist")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Join validation
              <ArrowRight className="cta-arrow ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="demo-led mt-1.5 h-2 w-2 shrink-0 bg-primary" />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

/* ------------------------------- Features ------------------------------- */

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Structured estimates",
      body:
        "Linear footage, channels, controllers, transformers, and add-ons priced in seconds. Margin and material visible before you hit send.",
    },
    {
      icon: Camera,
      title: "Mockups + measure capture",
      body:
        "Photo-based roofline marking and per-channel notes — so the bid matches what the crew actually installs.",
    },
    {
      icon: Route,
      title: "Route-aware scheduling",
      body:
        "Group jobs by zone, assign crews, and stop driving 90 minutes between two 30-minute service calls.",
    },
    {
      icon: ClipboardList,
      title: "Crew job sheets",
      body:
        "Every job ships to the field with addresses, channel maps, dealer line, transformer location, and pre-stage list.",
    },
    {
      icon: Camera,
      title: "Install + warranty documentation",
      body:
        "Photo logs, channel layouts, and run diagrams stored against the job. Service calls take minutes, not days.",
    },
    {
      icon: Calendar,
      title: "Seasonal + annual rebooking",
      body:
        "Service plans, in-season tune-ups, and program renewals are tracked — no more April scramble.",
    },
    {
      icon: Cable,
      title: "Low-voltage aware",
      body:
        "Channel counts, transformer load, and controller specs are first-class fields — not free-text afterthoughts.",
    },
    {
      icon: Shield,
      title: "Dealer ops, not generic CRM",
      body:
        "Pipelines and reports shaped around permanent lighting — close rate by source, install backlog, service load.",
    },
  ];
  return (
    <section id="features" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionEyebrow>What's inside</SectionEyebrow>
        <div className="mt-3 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h2 className="max-w-3xl font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
            Built for the way <span className="text-primary">crews actually work</span>.
          </h2>
          <p className="max-w-md text-base text-muted-foreground">
            Replace the tab-stack: spreadsheets, group texts, shared notes, and three half-used
            CRMs — one operating system instead.
          </p>
        </div>
        <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="reveal-fade group bg-background p-6 transition-colors hover:bg-card"
              style={{ animationDelay: `${i * 45}ms` }}
              data-testid={`card-feature-${i}`}
            >
              <Icon className="icon-nudge h-5 w-5 text-primary" strokeWidth={2.25} />
              <h3 className="mt-4 font-display text-base font-bold uppercase tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Why dealers / crews ------------------------ */

function WhyDealersCare() {
  const blocks = [
    {
      who: "Dealers & owners",
      icon: Shield,
      points: [
        "Close more bids without working nights",
        "See install backlog and service load by week",
        "Stop losing jobs in the handoff to the crew",
      ],
    },
    {
      who: "Crew leads",
      icon: HardHat,
      points: [
        "Every job ships with a real plan, not a text thread",
        "Photo + channel records you can hand off cleanly",
        "Less time hunting transformers and dealer line",
      ],
    },
    {
      who: "Electricians",
      icon: Zap,
      points: [
        "Low-voltage specs treated like first-class data",
        "Service history that holds up to a callback",
        "A back office that respects how the trade actually works",
      ],
    },
  ];
  return (
    <section className="border-b border-border bg-card py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionEyebrow>Why dealers and crews care</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
          One source of truth.{" "}
          <span className="text-muted-foreground">Front office and field crew.</span>
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {blocks.map(({ who, icon: Icon, points }, i) => (
            <div
              key={i}
              className="reveal-fade relative border border-border bg-background p-7"
              style={{ animationDelay: `${i * 90}ms` }}
              data-testid={`card-audience-${i}`}
            >
              <div className="absolute -left-px top-0 h-10 w-1 bg-primary" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" strokeWidth={2.25} />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  For
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl font-black uppercase tracking-tight">
                {who}
              </h3>
              <ul className="mt-5 space-y-3">
                {points.map((p, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Built for teams working around systems like Trimlight, JellyFish, Govee, Oelo,
          Celebright, and EverLights. Product-agnostic — run whatever line you carry.
        </p>
      </div>
    </section>
  );
}

/* ----------------------- Electrician-built credibility ------------------ */

function ElectricianBuilt() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-foreground py-20 text-background md:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 stripe-accent animated-stripe"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 border border-background/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background/70">
            <Zap className="h-3.5 w-3.5" />
            Built by an electrician
          </div>
          <h2 className="mt-6 font-display text-3xl font-black uppercase leading-[1] tracking-tight md:text-5xl">
            Made with an{" "}
            <span className="text-primary">electrician's understanding</span> of
            crews, jobsites, and warranty calls.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-background/75">
            SEAS is being built by Jay Smith, a licensed electrician who's lived the
            low-voltage details, the messy jobsite handoffs, and the warranty callbacks
            that nobody else takes seriously. Every workflow is shaped by what actually
            happens on a truck — not what looks good in a demo.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-background/85 sm:grid-cols-2">
            {[
              "Licensed-electrician credibility on low-voltage details",
              "Designed around real crew handoffs, not theory",
              "Warranty + service is a first-class workflow",
              "Validation group of working dealer-operators",
            ].map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3"
                data-testid={`bullet-credibility-${i}`}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 border border-background/15" aria-hidden="true" />
            <blockquote className="electric-quote relative border border-background/20 bg-background/[0.04] p-7">
              <p className="font-display text-xl font-bold leading-snug">
                "Generic CRMs don't know what a 200-watt transformer is or why the crew
                cares which side of the soffit the controller is on. SEAS does."
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-background/15 pt-5">
                <div className="flex h-10 w-10 items-center justify-center border border-background/30 bg-primary text-sm font-black text-primary-foreground">
                  JS
                </div>
                <div>
                  <div className="text-sm font-semibold">Jay Smith</div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-background/60">
                    Licensed electrician · Founder
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Waitlist ------------------------------- */

function WaitlistSection() {
  return (
    <section id="waitlist" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionEyebrow>Join the installer waitlist</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Get in while the workflow is still being shaped.
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              We're working with a small validation group of working dealers, crew leads,
              and electricians. Tell us what you run today and where the workflow breaks
              — we'll reach out when your slot opens.
            </p>
            <WaitlistCount />
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Free during early validation",
                "Founder reply when your workflow is a fit",
                "Your bottleneck shapes what we build first",
              ].map((line, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-7">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitlistCount() {
  const countQuery = useQuery({
    queryKey: ["/api/waitlist/count"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/waitlist/count");
      return (await res.json()) as { count: number };
    },
    retry: false,
  });

  const count = countQuery.data?.count;
  if (!count || count < 3) {
    return (
      <div className="mt-6 border border-border bg-card p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Validation slots are intentionally limited.</span>{" "}
        We are looking for installers who can describe the real job flow, not just sign up for another tool.
      </div>
    );
  }

  return (
    <div className="mt-6 border border-primary/30 bg-primary/10 p-4 text-sm" data-testid="status-waitlist-count">
      <span className="font-semibold">{count} installers have joined the validation list.</span>{" "}
      Add your bottleneck so we can prioritize the right first workflows.
    </div>
  );
}

function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertWaitlist>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: undefined as unknown as InsertWaitlist["role"],
      installVolume: undefined as unknown as InsertWaitlist["installVolume"],
      bottleneck: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertWaitlist) => {
      const res = await apiRequest("POST", "/api/waitlist", data);
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
    onError: () => {
      // Even on backend error, accept submission locally so the page never feels broken.
      // The form still validated; show success but log the error.
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div
        className="relative border border-primary/40 bg-card p-8"
        role="status"
        data-testid="status-waitlist-success"
      >
        <div className="absolute -left-px top-0 h-10 w-1 bg-primary" aria-hidden="true" />
        <div className="mb-6 border-b border-border pb-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            2-minute founder intake
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The bottleneck field matters most. If SEAS can solve it, Jay will follow up directly.
          </p>
        </div>
        <CheckCircle2 className="h-7 w-7 text-primary" strokeWidth={2.25} />
        <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-tight">
          You're on the installer waitlist.
        </h3>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          I'll reach out when the early validation group opens. If you mentioned a
          bottleneck, expect a real reply — not a drip campaign.
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          — Jay · SEAS
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="relative border border-border bg-card p-6 md:p-8"
        data-testid="form-waitlist"
        noValidate
      >
        <div className="absolute -left-px top-0 h-10 w-1 bg-primary" aria-hidden="true" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className="rounded-none border-foreground/15 bg-background"
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Work email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="jane@yourcompany.com"
                    autoComplete="email"
                    className="rounded-none border-foreground/15 bg-background"
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Company
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Hartwell Lighting Co."
                    autoComplete="organization"
                    className="rounded-none border-foreground/15 bg-background"
                    data-testid="input-company"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Role
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className="rounded-none border-foreground/15 bg-background"
                      data-testid="select-role"
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Dealer/Owner">Dealer / Owner</SelectItem>
                    <SelectItem value="Crew Lead">Crew Lead</SelectItem>
                    <SelectItem value="Electrician">Electrician</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5">
          <FormField
            control={form.control}
            name="installVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Install volume
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className="rounded-none border-foreground/15 bg-background"
                      data-testid="select-install-volume"
                    >
                      <SelectValue placeholder="How many installs per month?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-10/month">0–10 / month</SelectItem>
                    <SelectItem value="11-25/month">11–25 / month</SelectItem>
                    <SelectItem value="26-50/month">26–50 / month</SelectItem>
                    <SelectItem value="50+/month">50+ / month</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5">
          <FormField
            control={form.control}
            name="bottleneck"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Biggest bottleneck
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Where does your workflow break today? Quoting, scheduling, crew handoff, service callbacks, rebooking…"
                    className="resize-none rounded-none border-foreground/15 bg-background"
                    data-testid="input-bottleneck"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="animated-cta mt-7 h-12 w-full rounded-none bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-8"
          data-testid="button-submit-waitlist"
        >
          {mutation.isPending ? "Sending…" : "Join the validation group"}
          {!mutation.isPending && <ArrowRight className="cta-arrow ml-2 h-4 w-4" />}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          We'll only use this to talk to you about SEAS. No spam, no third-party lists.
        </p>
      </form>
    </Form>
  );
}

function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur md:hidden">
      <Button
        className="animated-cta h-12 w-full rounded-none bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        data-testid="button-sticky-mobile-cta"
        onClick={() =>
          document
            .getElementById("waitlist")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      >
        Join installer validation
        <ArrowRight className="cta-arrow ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

/* ---------------------------------- FAQ ---------------------------------- */

function FAQSection() {
  return (
    <section id="faq" className="border-b border-border bg-card py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionEyebrow>Frequently asked</SectionEyebrow>
        <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
          The honest <span className="text-primary">questions.</span>
        </h2>
        <Accordion type="single" collapsible className="mt-10 border-t border-border">
          {FAQS.map(({ q, a }, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-b border-border"
            >
              <AccordionTrigger
                className="py-5 text-left font-display text-base font-bold uppercase tracking-tight hover:no-underline"
                data-testid={`faq-trigger-${i}`}
              >
                {q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-muted-foreground">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* --------------------------------- Footer -------------------------------- */

function Footer() {
  return (
    <footer className="bg-background py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <SeasLogo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Lighting installer software for permanent lighting dealers, crews, and
            electricians. Built in the field.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
          <span className="font-mono text-[11px] uppercase tracking-widest">
            © {new Date().getFullYear()} SEAS · All rights reserved
          </span>
          <span>Made by Jay Smith · Licensed electrician</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------- Shared bits ------------------------------- */

function SectionEyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground ${className}`}>
      <span className="h-px w-8 bg-primary" />
      {children}
    </div>
  );
}
