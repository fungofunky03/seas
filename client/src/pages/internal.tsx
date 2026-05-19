import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SeasLogo } from "@/components/seas/Logo";
import { ArrowRight, BarChart3, Users, Wrench, type LucideIcon } from "lucide-react";

type ValidationSummary = {
  total: number;
  roleCounts: Record<string, number>;
  volumeCounts: Record<string, number>;
  bottleneckCounts: Record<string, number>;
  demoInterest: {
    total: number;
    lastStepCounts: Record<string, number>;
    mostClickedStepCounts: Record<string, number>;
  };
  updatedAt: number | string;
};

const EMPTY_SUMMARY: ValidationSummary = {
  total: 0,
  roleCounts: {},
  volumeCounts: {},
  bottleneckCounts: {},
  demoInterest: { total: 0, lastStepCounts: {}, mostClickedStepCounts: {} },
  updatedAt: Date.now(),
};

export default function InternalDashboard() {
  const summaryQuery = useQuery({
    queryKey: ["validation-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_validation_summary");
      if (error) throw error;
      return data as ValidationSummary;
    },
  });

  const summary = summaryQuery.data ?? EMPTY_SUMMARY;
  const topDemoStep = topEntry(summary.demoInterest.mostClickedStepCounts);
  const topBottleneck = topEntry(summary.bottleneckCounts);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <SeasLogo />
          <Button
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-back-to-site"
            onClick={() => {
              window.location.hash = "/";
            }}
          >
            Back to landing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Internal validation dashboard
            </div>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-6xl">
              SEAS signal board.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              A safe internal view of validation signals from the landing page. This dashboard
              summarizes interest without exposing lead emails on the shared page.
            </p>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Updated {new Date(summary.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
          <MetricCard
            icon={Users}
            label="Waitlist signups"
            value={summary.total.toString()}
            note="Installer validation leads"
          />
          <MetricCard
            icon={BarChart3}
            label="Top demo interest"
            value={formatLabel(topDemoStep?.[0] ?? "none")}
            note={topDemoStep ? `${topDemoStep[1]} signup(s) favored this flow` : "No demo clicks captured yet"}
          />
          <MetricCard
            icon={Wrench}
            label="Top bottleneck"
            value={formatLabel(topBottleneck?.[0] ?? "none")}
            note={topBottleneck ? `${topBottleneck[1]} mention(s) detected` : "No bottleneck signals yet"}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SignalPanel
            title="Demo step interest"
            description="Which workflow step visitors clicked most before submitting."
            data={summary.demoInterest.mostClickedStepCounts}
            fallbackLabels={["quote", "schedule", "install", "service"]}
            testIdPrefix="demo-interest"
          />
          <SignalPanel
            title="Last step before signup"
            description="The final workflow state a visitor looked at before joining."
            data={summary.demoInterest.lastStepCounts}
            fallbackLabels={["quote", "schedule", "install", "service"]}
            testIdPrefix="last-step"
          />
          <SignalPanel
            title="Role mix"
            description="Who is entering validation."
            data={summary.roleCounts}
            fallbackLabels={["Dealer/Owner", "Crew Lead", "Electrician", "Sales", "Other"]}
            testIdPrefix="role"
          />
          <SignalPanel
            title="Install volume"
            description="How much monthly job volume early leads report."
            data={summary.volumeCounts}
            fallbackLabels={["0-10/month", "11-25/month", "26-50/month", "50+/month"]}
            testIdPrefix="volume"
          />
        </div>

        <section className="mt-8 border border-border bg-card p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Build next
          </div>
          <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-tight">
            Internal tools
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            First shipped internal tool: a job-input → dealer-ready quote, margin math, and
            crew handoff packet. Use it from the field or the office to keep pricing,
            scope, and install plans synced before a customer ever sees a number.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="link-quote-generator"
              onClick={() => {
                window.location.hash = "/internal/quote-generator";
              }}
            >
              Open Auto Quote Generator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-none"
              data-testid="link-visualizer"
              onClick={() => {
                window.location.hash = "/internal/visualizer";
              }}
            >
              Open House Lighting Visualizer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-background p-6" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-primary">
        {value}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function SignalPanel({
  title,
  description,
  data,
  fallbackLabels,
  testIdPrefix,
}: {
  title: string;
  description: string;
  data: Record<string, number>;
  fallbackLabels: string[];
  testIdPrefix: string;
}) {
  const labels = Array.from(new Set([...fallbackLabels, ...Object.keys(data)]));
  const max = Math.max(1, ...labels.map((label) => data[label] ?? 0));

  return (
    <section className="border border-border bg-card p-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 space-y-4">
        {labels.map((label) => {
          const count = data[label] ?? 0;
          const width = `${Math.max(4, (count / max) * 100)}%`;
          return (
            <div key={label} data-testid={`row-${testIdPrefix}-${slug(label)}`}>
              <div className="mb-1 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest">
                <span>{formatLabel(label)}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 overflow-hidden bg-background">
                <div className="h-full bg-primary" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function topEntry(data: Record<string, number>) {
  return Object.entries(data)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])[0];
}

function formatLabel(label: string) {
  if (label === "none") return "None";
  return label
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
