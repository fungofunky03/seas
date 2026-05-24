import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { SeasLogo } from "@/components/seas/Logo";
import { ArrowLeft, Clipboard, RefreshCw, AlertTriangle } from "lucide-react";

type AccessDifficulty = "Easy" | "Normal" | "Difficult" | "Steep/Roofline";

type ProductSystem =
  | "Trimlight"
  | "JellyFish"
  | "Govee"
  | "Oelo"
  | "Celebright"
  | "EverLights"
  | "Custom";

type QuoteState = {
  customerName: string;
  address: string;
  productSystem: ProductSystem;
  eaveFootage: number;
  soffitFootage: number;
  zones: number;
  controllerCount: number;
  transformerCount: number;
  transformerWatts: number;
  liftRequired: boolean;
  accessDifficulty: AccessDifficulty;
  laborRate: number;
  crewSize: number;
  installHoursOverride: string; // blank for auto
  materialCostPerFoot: number;
  sellPricePerFoot: number;
  servicePlan: boolean;
  targetMarginPct: number; // 0-100
  notes: string;
};

const SAMPLE_JOB: QuoteState = {
  customerName: "Hartwell Residence",
  address: "412 Ridge Pkwy",
  productSystem: "Trimlight",
  eaveFootage: 218,
  soffitFootage: 64,
  zones: 4,
  controllerCount: 1,
  transformerCount: 2,
  transformerWatts: 200,
  liftRequired: false,
  accessDifficulty: "Normal",
  laborRate: 85,
  crewSize: 2,
  installHoursOverride: "",
  materialCostPerFoot: 9.5,
  sellPricePerFoot: 28,
  servicePlan: true,
  targetMarginPct: 38,
  notes: "",
};

const ACCESS_MULTIPLIER: Record<AccessDifficulty, number> = {
  Easy: 0.9,
  Normal: 1,
  Difficult: 1.2,
  "Steep/Roofline": 1.35,
};

const PRODUCT_OPTIONS: ProductSystem[] = [
  "Trimlight",
  "JellyFish",
  "Govee",
  "Oelo",
  "Celebright",
  "EverLights",
  "Custom",
];

const ACCESS_OPTIONS: AccessDifficulty[] = [
  "Easy",
  "Normal",
  "Difficult",
  "Steep/Roofline",
];

const money = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;

function computeQuote(s: QuoteState) {
  const totalFootage = s.eaveFootage + s.soffitFootage;
  const accessMult = ACCESS_MULTIPLIER[s.accessDifficulty];
  const baseMaterialCost = totalFootage * s.materialCostPerFoot;
  const controllerTransformerCost =
    s.controllerCount * 180 + s.transformerCount * 145;
  const liftAllowance = s.liftRequired ? 450 : 0;
  const autoInstallHours = Math.max(
    6,
    Math.round((totalFootage / 55) * accessMult * 2) / 2,
  );
  const overrideRaw = s.installHoursOverride.trim();
  const overrideNum = overrideRaw === "" ? NaN : Number(overrideRaw);
  const installHours =
    overrideRaw !== "" && Number.isFinite(overrideNum) && overrideNum > 0
      ? overrideNum
      : autoInstallHours;
  const laborCost = installHours * s.crewSize * s.laborRate;
  const servicePlanSell = s.servicePlan ? 495 : 0;
  const baseSellPrice =
    totalFootage * s.sellPricePerFoot +
    s.controllerCount * 350 +
    s.transformerCount * 250 +
    liftAllowance +
    servicePlanSell;
  const estimatedCost =
    baseMaterialCost + controllerTransformerCost + laborCost + liftAllowance;
  const grossProfit = baseSellPrice - estimatedCost;
  const margin = baseSellPrice > 0 ? grossProfit / baseSellPrice : 0;
  const targetMargin = Math.min(0.95, Math.max(0, s.targetMarginPct / 100));
  const suggestedSellForTarget =
    targetMargin < 1 ? estimatedCost / (1 - targetMargin) : estimatedCost;

  return {
    totalFootage,
    accessMult,
    baseMaterialCost,
    controllerTransformerCost,
    liftAllowance,
    autoInstallHours,
    installHours,
    laborCost,
    servicePlanSell,
    baseSellPrice,
    estimatedCost,
    grossProfit,
    margin,
    targetMargin,
    suggestedSellForTarget,
  };
}

function statusForMargin(actual: number, target: number, footage: number) {
  if (footage < 50) {
    return {
      label: "Scope needs detail",
      tone: "warn" as const,
    };
  }
  if (actual >= target) {
    return { label: "Margin healthy", tone: "good" as const };
  }
  return { label: "Review margin", tone: "warn" as const };
}

export default function QuoteGeneratorPage() {
  const [s, setS] = useState<QuoteState>(SAMPLE_JOB);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  const calc = useMemo(() => computeQuote(s), [s]);
  const status = statusForMargin(calc.margin, calc.targetMargin, calc.totalFootage);

  const warnings: string[] = [];
  if (!s.customerName.trim()) warnings.push("Customer name is empty.");
  if (!s.address.trim()) warnings.push("Address is empty.");
  if (calc.totalFootage < 50)
    warnings.push("Total footage under 50 — scope needs detail.");

  const set = <K extends keyof QuoteState>(key: K, value: QuoteState[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const num = (key: keyof QuoteState, raw: string) => {
    const v = raw === "" ? 0 : Number(raw);
    setS((prev) => ({ ...prev, [key]: Number.isFinite(v) ? v : 0 }) as QuoteState);
  };

  const buildProposalText = () => {
    const lines = [
      `SEAS PROPOSAL — ${s.productSystem}`,
      `Customer: ${s.customerName}`,
      `Address: ${s.address}`,
      ``,
      `Total quote: ${money(calc.baseSellPrice)}`,
      `Total footage: ${calc.totalFootage} ft (eave ${s.eaveFootage} / soffit ${s.soffitFootage})`,
      `Zones: ${s.zones}`,
      `Install window: ${calc.installHours} crew-hours (crew of ${s.crewSize})`,
      `Margin: ${(calc.margin * 100).toFixed(1)}% (target ${s.targetMarginPct}%)`,
      `Gross profit: ${money(calc.grossProfit)}`,
      ``,
      `Line items:`,
      `- Permanent lighting install (${calc.totalFootage} ft @ ${money(
        s.sellPricePerFoot,
      )}/ft): ${money(calc.totalFootage * s.sellPricePerFoot)}`,
      `- Controller package (x${s.controllerCount}): ${money(s.controllerCount * 350)}`,
      `- Transformer/power package (x${s.transformerCount} @ ${s.transformerWatts}W): ${money(s.transformerCount * 250)}`,
    ];
    if (calc.liftAllowance > 0)
      lines.push(`- Lift/access allowance: ${money(calc.liftAllowance)}`);
    if (calc.servicePlanSell > 0)
      lines.push(`- Year-one service plan: ${money(calc.servicePlanSell)}`);
    if (s.notes.trim()) {
      lines.push(``, `Notes: ${s.notes.trim()}`);
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const text = buildProposalText();
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
        setCopyState("ok");
        setTimeout(() => setCopyState("idle"), 1800);
        return;
      }
      throw new Error("clipboard unavailable");
    } catch {
      setCopyState("err");
      setTimeout(() => setCopyState("idle"), 1800);
    }
  };

  const handleReset = () => setS(SAMPLE_JOB);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <SeasLogo />
          <Button
            variant="outline"
            className="rounded-none"
            data-testid="button-back-to-internal"
            onClick={() => {
              window.location.hash = "/internal";
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Internal tool / quoting
            </div>
            <h1
              className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl"
              data-testid="text-page-title"
            >
              Auto Quote Generator
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Dealer-ready quotes, margin math, and a crew handoff packet from
              one set of job inputs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={status} />
            <Button
              variant="outline"
              className="rounded-none"
              data-testid="button-open-visualizer"
              onClick={() => {
                window.location.hash = "/internal/visualizer";
              }}
            >
              Open House Visualizer
            </Button>
            <Button
              variant="outline"
              className="rounded-none"
              data-testid="button-reset"
              onClick={handleReset}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset to sample job
            </Button>
            <Button
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-copy-proposal"
              onClick={handleCopy}
            >
              <Clipboard className="mr-2 h-4 w-4" />
              {copyState === "ok"
                ? "Copied"
                : copyState === "err"
                  ? "Copy failed"
                  : "Copy proposal summary"}
            </Button>
          </div>
        </div>

        {warnings.length > 0 && (
          <div
            className="mt-6 flex items-start gap-3 border border-primary/40 bg-primary/5 p-4"
            data-testid="panel-warnings"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 text-primary" />
            <ul className="space-y-1 text-sm">
              {warnings.map((w) => (
                <li key={w} data-testid="warning-item">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* LEFT: Inputs */}
          <section
            className="border border-border bg-card p-5 lg:col-span-4"
            data-testid="panel-inputs"
          >
            <PanelHeader title="Job inputs" subtitle="Customer + scope" />

            <div className="mt-4 space-y-4">
              <Field label="Customer name">
                <Input
                  data-testid="input-customer-name"
                  value={s.customerName}
                  onChange={(e) => set("customerName", e.target.value)}
                />
              </Field>
              <Field label="Address">
                <Input
                  data-testid="input-address"
                  value={s.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
              <Field label="Product / system">
                <Select
                  value={s.productSystem}
                  onValueChange={(v) => set("productSystem", v as ProductSystem)}
                >
                  <SelectTrigger
                    data-testid="select-product-system"
                    className="rounded-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Eave footage">
                  <Input
                    type="number"
                    data-testid="input-eave-footage"
                    value={s.eaveFootage}
                    onChange={(e) => num("eaveFootage", e.target.value)}
                  />
                </Field>
                <Field label="Soffit/return ft">
                  <Input
                    type="number"
                    data-testid="input-soffit-footage"
                    value={s.soffitFootage}
                    onChange={(e) => num("soffitFootage", e.target.value)}
                  />
                </Field>
                <Field label="Zones">
                  <Input
                    type="number"
                    data-testid="input-zones"
                    value={s.zones}
                    onChange={(e) => num("zones", e.target.value)}
                  />
                </Field>
                <Field label="Controllers">
                  <Input
                    type="number"
                    data-testid="input-controllers"
                    value={s.controllerCount}
                    onChange={(e) => num("controllerCount", e.target.value)}
                  />
                </Field>
                <Field label="Transformers">
                  <Input
                    type="number"
                    data-testid="input-transformers"
                    value={s.transformerCount}
                    onChange={(e) => num("transformerCount", e.target.value)}
                  />
                </Field>
                <Field label="Transformer watts">
                  <Input
                    type="number"
                    data-testid="input-transformer-watts"
                    value={s.transformerWatts}
                    onChange={(e) => num("transformerWatts", e.target.value)}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Lift required
                </Label>
                <Switch
                  data-testid="switch-lift-required"
                  checked={s.liftRequired}
                  onCheckedChange={(v) => set("liftRequired", v)}
                />
              </div>

              <Field label="Access difficulty">
                <Select
                  value={s.accessDifficulty}
                  onValueChange={(v) =>
                    set("accessDifficulty", v as AccessDifficulty)
                  }
                >
                  <SelectTrigger
                    data-testid="select-access-difficulty"
                    className="rounded-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Labor rate $/hr">
                  <Input
                    type="number"
                    data-testid="input-labor-rate"
                    value={s.laborRate}
                    onChange={(e) => num("laborRate", e.target.value)}
                  />
                </Field>
                <Field label="Crew size">
                  <Input
                    type="number"
                    data-testid="input-crew-size"
                    value={s.crewSize}
                    onChange={(e) => num("crewSize", e.target.value)}
                  />
                </Field>
                <Field
                  label={`Install hours (auto ${calc.autoInstallHours})`}
                >
                  <Input
                    type="number"
                    placeholder={String(calc.autoInstallHours)}
                    data-testid="input-install-hours"
                    value={s.installHoursOverride}
                    onChange={(e) =>
                      set("installHoursOverride", e.target.value)
                    }
                  />
                </Field>
                <Field label="Target margin %">
                  <Input
                    type="number"
                    data-testid="input-target-margin"
                    value={s.targetMarginPct}
                    onChange={(e) => num("targetMarginPct", e.target.value)}
                  />
                </Field>
                <Field label="Material $/ft">
                  <Input
                    type="number"
                    step="0.1"
                    data-testid="input-material-cost"
                    value={s.materialCostPerFoot}
                    onChange={(e) =>
                      num("materialCostPerFoot", e.target.value)
                    }
                  />
                </Field>
                <Field label="Sell $/ft">
                  <Input
                    type="number"
                    step="0.5"
                    data-testid="input-sell-price"
                    value={s.sellPricePerFoot}
                    onChange={(e) => num("sellPricePerFoot", e.target.value)}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Add service plan
                </Label>
                <Switch
                  data-testid="switch-service-plan"
                  checked={s.servicePlan}
                  onCheckedChange={(v) => set("servicePlan", v)}
                />
              </div>

              <Field label="Notes / access notes">
                <Textarea
                  data-testid="textarea-notes"
                  value={s.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Gate code, dog on premises, side-yard ladder route, etc."
                  className="min-h-[88px]"
                />
              </Field>
            </div>
          </section>

          {/* CENTER: Quote math + proposal summary */}
          <section
            className="space-y-6 lg:col-span-5"
            data-testid="panel-quote"
          >
            <div className="border border-border bg-card p-5">
              <PanelHeader
                title="Proposal summary"
                subtitle={`${s.productSystem} install for ${s.customerName || "—"}`}
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Metric
                  label="Total quote"
                  value={money(calc.baseSellPrice)}
                  testId="metric-total-quote"
                  accent
                />
                <Metric
                  label="Margin"
                  value={`${(calc.margin * 100).toFixed(1)}%`}
                  testId="metric-margin"
                />
                <Metric
                  label="Gross profit"
                  value={money(calc.grossProfit)}
                  testId="metric-gross-profit"
                />
                <Metric
                  label="Total footage"
                  value={`${calc.totalFootage} ft`}
                  testId="metric-total-footage"
                />
                <Metric
                  label="Install window"
                  value={`${calc.installHours} hrs · crew ${s.crewSize}`}
                  testId="metric-install-window"
                />
                <Metric
                  label="Zones"
                  value={String(s.zones)}
                  testId="metric-zones"
                />
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>Margin vs target</span>
                  <span data-testid="text-margin-vs-target">
                    {(calc.margin * 100).toFixed(1)}% / {s.targetMarginPct}%
                  </span>
                </div>
                <Progress
                  value={Math.max(
                    0,
                    Math.min(
                      100,
                      calc.targetMargin > 0
                        ? (calc.margin / calc.targetMargin) * 100
                        : 0,
                    ),
                  )}
                  className="h-2 rounded-none bg-muted"
                />
                {calc.margin < calc.targetMargin && calc.baseSellPrice > 0 && (
                  <p
                    className="mt-3 text-sm text-primary"
                    data-testid="text-margin-suggestion"
                  >
                    Below target — suggested sell price to hit {s.targetMarginPct}%:{" "}
                    <strong>{money(calc.suggestedSellForTarget)}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="border border-border bg-card p-5">
              <PanelHeader
                title="Line items"
                subtitle="Sell-side breakdown"
              />
              <table
                className="mt-4 w-full text-sm"
                data-testid="table-line-items"
              >
                <thead>
                  <tr className="border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-2 text-left">Item</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <LineItem
                    label="Permanent lighting install"
                    qty={`${calc.totalFootage} ft`}
                    amount={calc.totalFootage * s.sellPricePerFoot}
                    testId="line-install"
                  />
                  <LineItem
                    label="Controller package"
                    qty={`x${s.controllerCount}`}
                    amount={s.controllerCount * 350}
                    testId="line-controller"
                  />
                  <LineItem
                    label="Transformer/power package"
                    qty={`x${s.transformerCount}`}
                    amount={s.transformerCount * 250}
                    testId="line-transformer"
                  />
                  {calc.liftAllowance > 0 && (
                    <LineItem
                      label="Lift/access allowance"
                      qty="—"
                      amount={calc.liftAllowance}
                      testId="line-lift"
                    />
                  )}
                  {s.servicePlan && (
                    <LineItem
                      label="Year-one service plan"
                      qty="1 yr"
                      amount={calc.servicePlanSell}
                      testId="line-service"
                    />
                  )}
                </tbody>
              </table>
            </div>

            <div className="border border-border bg-card p-5">
              <PanelHeader
                title="Cost breakdown"
                subtitle="Internal cost math — do not share with customer"
              />
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <CostRow
                  label="Materials"
                  value={money(calc.baseMaterialCost)}
                  testId="cost-materials"
                />
                <CostRow
                  label="Controllers + transformers"
                  value={money(calc.controllerTransformerCost)}
                  testId="cost-controllers"
                />
                <CostRow
                  label="Labor"
                  value={money(calc.laborCost)}
                  testId="cost-labor"
                />
                <CostRow
                  label="Lift allowance"
                  value={money(calc.liftAllowance)}
                  testId="cost-lift"
                />
                <CostRow
                  label="Estimated total cost"
                  value={money(calc.estimatedCost)}
                  testId="cost-total"
                  strong
                />
                <CostRow
                  label="Access multiplier"
                  value={`x${calc.accessMult}`}
                  testId="cost-access-mult"
                />
              </dl>
            </div>
          </section>

          {/* RIGHT: Crew handoff + checklists */}
          <section
            className="space-y-6 lg:col-span-3"
            data-testid="panel-handoff"
          >
            <div className="border border-border bg-card p-5">
              <PanelHeader
                title="Crew handoff packet"
                subtitle="Print/share with install lead"
              />
              <dl
                className="mt-4 space-y-3 text-sm"
                data-testid="list-crew-handoff"
              >
                <HandoffRow label="Customer" value={s.customerName || "—"} />
                <HandoffRow label="Address" value={s.address || "—"} />
                <HandoffRow
                  label="Footage / zones"
                  value={`${calc.totalFootage} ft · ${s.zones} zones`}
                />
                <HandoffRow
                  label="Controller(s)"
                  value={`${s.controllerCount} — placement TBD`}
                />
                <HandoffRow
                  label="Transformer(s)"
                  value={`${s.transformerCount} @ ${s.transformerWatts}W`}
                />
                <HandoffRow
                  label="Access / lift"
                  value={`${s.accessDifficulty}${s.liftRequired ? " · LIFT" : ""}`}
                />
                <HandoffRow
                  label="Material pre-stage"
                  value={`${calc.totalFootage} ft track/lens, ${s.controllerCount} controller, ${s.transformerCount} transformer`}
                />
                {s.notes.trim() && (
                  <HandoffRow label="Notes" value={s.notes.trim()} />
                )}
              </dl>
            </div>

            <div className="border border-border bg-card p-5">
              <PanelHeader title="Install checklist" subtitle="Field-ready" />
              <ul
                className="mt-4 space-y-2 text-sm"
                data-testid="list-install-checklist"
              >
                {[
                  "Verify measurements before mounting",
                  "Stage track / lens / controller / power supplies by zone",
                  "Confirm transformer placement and outlet access",
                  "Test all zones before ladder/lift teardown",
                  "Capture final photos and run diagram",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2"
                    data-testid="checklist-item"
                  >
                    <span className="mt-1 inline-block h-3 w-3 shrink-0 border border-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border bg-card p-5">
              <PanelHeader
                title="Service record stub"
                subtitle="Goes to service log"
              />
              <dl
                className="mt-4 space-y-3 text-sm"
                data-testid="list-service-record"
              >
                <HandoffRow
                  label="Warranty / service"
                  value={
                    s.servicePlan
                      ? "Year-one service plan included"
                      : "No service plan attached"
                  }
                />
                <HandoffRow
                  label="Zones captured"
                  value={String(s.zones)}
                />
                <HandoffRow
                  label="Controllers captured"
                  value={String(s.controllerCount)}
                />
                <HandoffRow
                  label="First recheck"
                  value="Suggest annual recheck reminder"
                />
              </dl>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  testId,
  accent,
}: {
  label: string;
  value: string;
  testId: string;
  accent?: boolean;
}) {
  return (
    <div data-testid={testId} className="border border-border bg-background p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-xl font-black tracking-tight ${
          accent ? "text-primary" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function LineItem({
  label,
  qty,
  amount,
  testId,
}: {
  label: string;
  qty: string;
  amount: number;
  testId: string;
}) {
  return (
    <tr data-testid={testId}>
      <td className="py-2 pr-2">{label}</td>
      <td className="py-2 text-right font-mono text-xs text-muted-foreground">
        {qty}
      </td>
      <td className="py-2 text-right font-mono">{money(amount)}</td>
    </tr>
  );
}

function CostRow({
  label,
  value,
  testId,
  strong,
}: {
  label: string;
  value: string;
  testId: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-border/60 pb-2 ${
        strong ? "font-bold" : ""
      }`}
      data-testid={testId}
    >
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

function HandoffRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function StatusChip({
  status,
}: {
  status: { label: string; tone: "good" | "warn" };
}) {
  const tone =
    status.tone === "good"
      ? "border-foreground bg-foreground text-background"
      : "border-primary bg-primary/10 text-primary";
  return (
    <span
      data-testid="status-chip"
      className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${tone}`}
    >
      <span
        className={`h-2 w-2 ${
          status.tone === "good" ? "bg-background" : "bg-primary"
        }`}
      />
      {status.label}
    </span>
  );
}
