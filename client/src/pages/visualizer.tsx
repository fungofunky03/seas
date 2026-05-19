import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SeasLogo } from "@/components/seas/Logo";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Download,
  Clipboard,
  Image as ImageIcon,
  Wand2,
  Undo2,
  Eraser,
  Camera,
} from "lucide-react";
import {
  type ColorMode,
  type DetectionResult,
  type Point,
  colorForBulb,
  detectSoffitLine,
  sampleAlongPolyline,
} from "@/lib/visualizer";

type ProductSystem =
  | "Trimlight"
  | "JellyFish"
  | "Govee"
  | "Oelo"
  | "Celebright"
  | "EverLights"
  | "Custom";

const PRODUCT_OPTIONS: ProductSystem[] = [
  "Trimlight",
  "JellyFish",
  "Govee",
  "Oelo",
  "Celebright",
  "EverLights",
  "Custom",
];

const COLOR_MODES: ColorMode[] = [
  "Warm White",
  "Cool White",
  "RGB Demo",
  "Red/Green Holiday",
  "Soft Architectural",
];

type OverlayStyle = "Dot lights" | "Continuous glow";

const SALES_CHECKLIST = [
  "Confirm soffit path",
  "Verify controller location",
  "Measure linear footage",
  "Review power access",
  "Attach preview to quote",
];

export default function HouseVisualizer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 });

  const [detected, setDetected] = useState<DetectionResult | null>(null);
  const [manualPoints, setManualPoints] = useState<Point[]>([]);
  const [detecting, setDetecting] = useState(false);

  const [product, setProduct] = useState<ProductSystem>("Trimlight");
  const [colorMode, setColorMode] = useState<ColorMode>("Warm White");
  const [spacing, setSpacing] = useState(18);
  const [brightness, setBrightness] = useState(0.85);
  const [overlayStyle, setOverlayStyle] = useState<OverlayStyle>("Dot lights");

  const [customer, setCustomer] = useState("Hartwell Residence");
  const [address, setAddress] = useState("412 Ridge Pkwy");
  const [projectName, setProjectName] = useState("Holiday + everyday preview");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const activeLine = manualPoints.length >= 2 ? manualPoints : detected?.points ?? [];
  const usingManual = manualPoints.length >= 2;

  const confidenceLabel: string = useMemo(() => {
    if (usingManual) return "Manual";
    if (!detected) return "—";
    if (detected.confidence === "Low") return "Low · Needs manual adjustment";
    return detected.confidence;
  }, [detected, usingManual]);

  // --- Image loading ---
  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setManualPoints([]);
    setDetected(null);
  }, []);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  // --- Auto detect when a new image lands ---
  const runDetection = useCallback(async () => {
    const img = imageRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    setDetecting(true);
    try {
      const result = await detectSoffitLine(img);
      setDetected(result);
    } finally {
      setDetecting(false);
    }
  }, []);

  // --- Responsive canvas sizing ---
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const img = imageRef.current;
      const aspect = img && img.naturalWidth > 0 ? img.naturalWidth / img.naturalHeight : 16 / 10;
      const w = Math.max(280, Math.floor(cr.width));
      const h = Math.max(180, Math.floor(w / aspect));
      setCanvasSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageUrl]);

  // --- Render the canvas (image + overlay) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = imageRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#666";
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillText("Upload a house photo to begin.", 16, 24);
    }

    if (activeLine.length >= 2) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      activeLine.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      const bulbs = sampleAlongPolyline(
        activeLine,
        canvas.width,
        canvas.height,
        spacing,
      );

      if (overlayStyle === "Continuous glow") {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        bulbs.forEach((p, i) => {
          const color = colorForBulb(colorMode, i, brightness);
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, spacing);
          grd.addColorStop(0, color);
          grd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, spacing, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        bulbs.forEach((p, i) => {
          const color = colorForBulb(colorMode, i, brightness);
          const r = Math.max(2, spacing * 0.18);
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
          halo.addColorStop(0, color);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Render manual control points so the user can see where they clicked.
      if (usingManual) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.strokeStyle = "rgba(214, 24, 36, 1)";
        ctx.lineWidth = 2;
        manualPoints.forEach((p) => {
          const x = p.x * canvas.width;
          const y = p.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      }
    }
  }, [
    activeLine,
    brightness,
    canvasSize,
    colorMode,
    manualPoints,
    overlayStyle,
    spacing,
    usingManual,
    imageUrl,
    detected,
  ]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageUrl) return;
      const rect = canvas.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width;
      const yNorm = (e.clientY - rect.top) / rect.height;
      setManualPoints((prev) => [...prev, { x: xNorm, y: yNorm }]);
    },
    [imageUrl],
  );

  const handleImageLoaded = useCallback(() => {
    runDetection();
  }, [runDetection]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `seas-visualizer-${(customer || "preview").replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [customer]);

  const handleCopy = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setCopyState("err");
      setTimeout(() => setCopyState("idle"), 1800);
      return;
    }
    try {
      const ClipboardItemCtor: typeof ClipboardItem | undefined =
        typeof window !== "undefined" ? (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem : undefined;
      if (!navigator.clipboard || !ClipboardItemCtor || !navigator.clipboard.write) {
        handleDownload();
        setCopyState("err");
        setTimeout(() => setCopyState("idle"), 1800);
        return;
      }
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });
      await navigator.clipboard.write([new ClipboardItemCtor({ "image/png": blob })]);
      setCopyState("ok");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("err");
      setTimeout(() => setCopyState("idle"), 1800);
    }
  }, [handleDownload]);

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
              Internal tool / sales visualization
            </div>
            <h1
              className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl"
              data-testid="text-page-title"
            >
              House Lighting Visualizer
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Upload a customer's house photo, drop a soffit line, and show them what
              permanent lighting could look like — before they ask for a number.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ConfidenceChip label={confidenceLabel} />
          </div>
        </div>

        <div
          className="mt-6 flex items-start gap-3 border border-primary/40 bg-primary/5 p-4"
          data-testid="panel-disclaimer"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 text-primary" />
          <p className="text-sm">
            AI detection is an assist, not a measurement. Always verify roofline, soffit
            path, and power access on site before quoting a final number.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* LEFT: Upload + product controls */}
          <section
            className="space-y-4 border border-border bg-card p-5 lg:col-span-3"
            data-testid="panel-controls"
          >
            <PanelHeader title="Source image" subtitle="Upload or capture" />
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                data-testid="input-file"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                data-testid="input-camera"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Button
                className="w-full rounded-none"
                variant="outline"
                data-testid="button-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload photo
              </Button>
              <Button
                className="w-full rounded-none"
                variant="outline"
                data-testid="button-camera"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Use camera
              </Button>
            </div>

            <PanelHeader title="Detection" subtitle="Client-side, no cloud" />
            <Button
              className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-detect"
              onClick={runDetection}
              disabled={!imageUrl || detecting}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {detecting ? "Scanning…" : "Auto-detect soffit line"}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="rounded-none"
                data-testid="button-clear-points"
                onClick={() => setManualPoints([])}
                disabled={manualPoints.length === 0}
              >
                <Eraser className="mr-1 h-3 w-3" />
                Clear
              </Button>
              <Button
                variant="outline"
                className="rounded-none"
                data-testid="button-undo-point"
                onClick={() => setManualPoints((p) => p.slice(0, -1))}
                disabled={manualPoints.length === 0}
              >
                <Undo2 className="mr-1 h-3 w-3" />
                Undo
              </Button>
              <Button
                variant="outline"
                className="rounded-none"
                data-testid="button-use-detected"
                onClick={() => setManualPoints([])}
                disabled={!detected || detected.points.length < 2}
              >
                Use auto
              </Button>
            </div>

            <PanelHeader title="Product & color" subtitle="Overlay style" />
            <Field label="Product system">
              <Select value={product} onValueChange={(v) => setProduct(v as ProductSystem)}>
                <SelectTrigger
                  data-testid="select-product"
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
            <Field label="Color mode">
              <Select
                value={colorMode}
                onValueChange={(v) => setColorMode(v as ColorMode)}
              >
                <SelectTrigger
                  data-testid="select-color-mode"
                  className="rounded-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_MODES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={`Light spacing — ${spacing}px`}>
              <Slider
                value={[spacing]}
                min={6}
                max={80}
                step={1}
                onValueChange={(v) => setSpacing(v[0] ?? spacing)}
                data-testid="slider-spacing"
              />
            </Field>
            <Field label={`Brightness — ${Math.round(brightness * 100)}%`}>
              <Slider
                value={[Math.round(brightness * 100)]}
                min={20}
                max={100}
                step={1}
                onValueChange={(v) => setBrightness((v[0] ?? 85) / 100)}
                data-testid="slider-brightness"
              />
            </Field>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {overlayStyle === "Dot lights" ? "Dot lights" : "Continuous glow"}
              </Label>
              <Switch
                data-testid="switch-overlay-style"
                checked={overlayStyle === "Continuous glow"}
                onCheckedChange={(v) =>
                  setOverlayStyle(v ? "Continuous glow" : "Dot lights")
                }
              />
            </div>
          </section>

          {/* CENTER: Canvas */}
          <section className="space-y-4 lg:col-span-6" data-testid="panel-canvas">
            <div ref={wrapperRef} className="border border-border bg-card p-3">
              <PanelHeader
                title={`Preview · ${product}`}
                subtitle="Click on the image to add or replace soffit line points"
              />
              <div className="relative mt-3 bg-black">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="block w-full cursor-crosshair"
                  data-testid="canvas-preview"
                />
                {imageUrl && (
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="customer house"
                    className="hidden"
                    onLoad={handleImageLoaded}
                    data-testid="image-source"
                  />
                )}
                {!imageUrl && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground"
                    data-testid="empty-state"
                  >
                    <ImageIcon className="h-8 w-8 opacity-50" />
                    <p className="font-mono text-[11px] uppercase tracking-widest">
                      No image yet
                    </p>
                    <p className="max-w-sm text-xs">
                      Upload a customer's house photo to start placing a lighting
                      visualization.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleDownload}
                  data-testid="button-download"
                  disabled={!imageUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download visualization
                </Button>
                <Button
                  variant="outline"
                  className="rounded-none"
                  onClick={handleCopy}
                  data-testid="button-copy"
                  disabled={!imageUrl}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  {copyState === "ok"
                    ? "Copied"
                    : copyState === "err"
                      ? "Copy unsupported — downloaded instead"
                      : "Copy image"}
                </Button>
                <span
                  className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  data-testid="text-line-points"
                >
                  {usingManual
                    ? `Manual · ${manualPoints.length} pts`
                    : detected
                      ? `Auto · ${detected.points.length} pts`
                      : "No line yet"}
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT: Buyer-facing preview meta + workflow */}
          <section className="space-y-6 lg:col-span-3" data-testid="panel-sales">
            <div className="border border-border bg-card p-5">
              <PanelHeader
                title={`Preview for ${customer || "Customer"}`}
                subtitle="Buyer-facing context"
              />
              <p
                className="mt-3 text-xs text-muted-foreground"
                data-testid="text-preview-disclaimer"
              >
                This is a concept overlay for sales visualization. Final placement
                depends on measurements, power, and product specs.
              </p>
              <div className="mt-4 space-y-3">
                <Field label="Customer name">
                  <Input
                    data-testid="input-customer-name"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  />
                </Field>
                <Field label="Address">
                  <Input
                    data-testid="input-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
                <Field label="Project name">
                  <Input
                    data-testid="input-project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </Field>
                <p className="text-[11px] text-muted-foreground">
                  Stored in-session only. Persistence comes when we wire the
                  visualizer to the lead-review cockpit.
                </p>
              </div>
            </div>

            <div className="border border-border bg-card p-5">
              <PanelHeader
                title="Sales workflow"
                subtitle="Run through before you quote"
              />
              <ul
                className="mt-4 space-y-2 text-sm"
                data-testid="list-sales-checklist"
              >
                {SALES_CHECKLIST.map((item) => {
                  const isChecked = !!checked[item];
                  return (
                    <li
                      key={item}
                      className="flex items-start gap-2"
                      data-testid="sales-checklist-item"
                    >
                      <button
                        type="button"
                        className={`mt-1 inline-block h-3 w-3 shrink-0 border ${
                          isChecked ? "border-primary bg-primary" : "border-foreground"
                        }`}
                        onClick={() =>
                          setChecked((prev) => ({ ...prev, [item]: !prev[item] }))
                        }
                        aria-label={`Toggle ${item}`}
                      />
                      <span className={isChecked ? "line-through text-muted-foreground" : ""}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border border-border bg-card p-5">
              <PanelHeader title="Next step" subtitle="Hand off to pricing" />
              <p className="mt-3 text-xs text-muted-foreground">
                Quote generator is its own tool today — preview data isn't persisted
                yet, so you'll re-enter the customer info there.
              </p>
              <Button
                className="mt-4 w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-to-quote-generator"
                onClick={() => {
                  window.location.hash = "/internal/quote-generator";
                }}
              >
                Send to quote generator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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

function ConfidenceChip({ label }: { label: string }) {
  const tone =
    label === "High" || label === "Manual"
      ? "border-foreground bg-foreground text-background"
      : label.startsWith("Low") || label === "—"
        ? "border-primary bg-primary/10 text-primary"
        : "border-foreground/40 bg-card text-foreground";
  return (
    <span
      data-testid="chip-confidence"
      className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${tone}`}
    >
      <span className="h-2 w-2 bg-current" />
      Detection · {label}
    </span>
  );
}
