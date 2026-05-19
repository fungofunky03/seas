// Pure utilities for the House Lighting Visualizer.
//
// Detection strategy (client-only, no cloud APIs):
//   1. Downsample the source image to a small working canvas.
//   2. Convert to grayscale + compute a row-wise "horizon score" that combines
//      vertical brightness drop (sky → house) with horizontal edge density.
//   3. Pick the strongest row in the upper third of the image as a seed.
//   4. Walk left-to-right along the seed row, snapping to the brightest local
//      horizontal edge in a small vertical neighborhood. This yields a polyline
//      approximating the roofline/soffit silhouette.
//
// The output is always normalized to [0,1] image coordinates so callers can map
// it back to any canvas size. Confidence is a coarse High/Medium/Low bucket
// based on the seed strength and how steady the snap was while walking.

export type Point = { x: number; y: number };

export type DetectionResult = {
  points: Point[]; // normalized 0..1 in image space
  confidence: "High" | "Medium" | "Low";
  score: number;
};

const WORK_W = 320;
const WORK_H = 200;

function toGray(data: Uint8ClampedArray): Float32Array {
  const out = new Float32Array(data.length / 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    out[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return out;
}

function sobelHoriz(gray: Float32Array, w: number, h: number): Float32Array {
  // Approximate horizontal-edge magnitude (sensitive to vertical brightness change).
  const out = new Float32Array(gray.length);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const top = gray[i - w - 1] + 2 * gray[i - w] + gray[i - w + 1];
      const bot = gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      out[i] = Math.abs(top - bot);
    }
  }
  return out;
}

/**
 * Detect a single roofline/soffit polyline from a source image.
 * Returns normalized points along with a coarse confidence label.
 */
export async function detectSoffitLine(image: HTMLImageElement): Promise<DetectionResult> {
  const canvas = document.createElement("canvas");
  canvas.width = WORK_W;
  canvas.height = WORK_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { points: [], confidence: "Low", score: 0 };
  }
  ctx.drawImage(image, 0, 0, WORK_W, WORK_H);
  const pixels = ctx.getImageData(0, 0, WORK_W, WORK_H).data;
  const gray = toGray(pixels);
  const edges = sobelHoriz(gray, WORK_W, WORK_H);

  // Row scores: emphasize rows where brightness above is high (sky) and below
  // is lower (house wall) AND there are strong horizontal edges along the row.
  const rowScore = new Float32Array(WORK_H);
  const bandAbove = 8;
  const bandBelow = 8;
  for (let y = bandAbove; y < WORK_H - bandBelow; y++) {
    let edgeSum = 0;
    let aboveSum = 0;
    let belowSum = 0;
    for (let x = 0; x < WORK_W; x++) {
      edgeSum += edges[y * WORK_W + x];
      for (let k = 1; k <= bandAbove; k++) aboveSum += gray[(y - k) * WORK_W + x];
      for (let k = 1; k <= bandBelow; k++) belowSum += gray[(y + k) * WORK_W + x];
    }
    const drop = (aboveSum / bandAbove - belowSum / bandBelow) / WORK_W;
    rowScore[y] = edgeSum / WORK_W + Math.max(0, drop) * 1.5;
  }

  // Pick seed in upper 60% of image — rooflines are rarely at the very bottom.
  let bestY = -1;
  let bestScore = -Infinity;
  const upperBound = Math.floor(WORK_H * 0.6);
  for (let y = bandAbove; y < upperBound; y++) {
    if (rowScore[y] > bestScore) {
      bestScore = rowScore[y];
      bestY = y;
    }
  }
  if (bestY < 0) {
    return { points: [], confidence: "Low", score: 0 };
  }

  // Walk left-to-right, snapping to strongest edge within ±snapRange of last y.
  const snapRange = 10;
  const steps = 24;
  const polyline: Point[] = [];
  let driftCost = 0;
  let lastY = bestY;
  for (let s = 0; s < steps; s++) {
    const x = Math.round((s / (steps - 1)) * (WORK_W - 1));
    let localBest = lastY;
    let localScore = -Infinity;
    const yMin = Math.max(1, lastY - snapRange);
    const yMax = Math.min(WORK_H - 2, lastY + snapRange);
    for (let y = yMin; y <= yMax; y++) {
      const e = edges[y * WORK_W + x];
      // Slight penalty for vertical drift, to prefer roughly continuous lines.
      const score = e - Math.abs(y - lastY) * 0.4;
      if (score > localScore) {
        localScore = score;
        localBest = y;
      }
    }
    driftCost += Math.abs(localBest - lastY);
    lastY = localBest;
    polyline.push({ x: x / (WORK_W - 1), y: localBest / (WORK_H - 1) });
  }

  // Confidence: combine seed strength with low drift.
  const normalizedSeed = Math.min(1, bestScore / 80);
  const stability = Math.max(0, 1 - driftCost / (steps * snapRange));
  const score = normalizedSeed * 0.6 + stability * 0.4;
  const confidence: DetectionResult["confidence"] =
    score >= 0.65 ? "High" : score >= 0.4 ? "Medium" : "Low";

  return { points: polyline, confidence, score };
}

/**
 * Walk a normalized polyline and emit evenly-spaced points (in canvas pixels)
 * along its length. Used to place individual light glyphs.
 */
export function sampleAlongPolyline(
  points: Point[],
  canvasW: number,
  canvasH: number,
  spacingPx: number,
): Point[] {
  if (points.length < 2 || spacingPx <= 0) return [];
  const pts = points.map((p) => ({ x: p.x * canvasW, y: p.y * canvasH }));
  const out: Point[] = [];
  let carry = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const segLen = Math.hypot(dx, dy);
    if (segLen <= 0) continue;
    let t = carry === 0 ? 0 : (spacingPx - carry) / segLen;
    while (t <= 1) {
      out.push({ x: a.x + dx * t, y: a.y + dy * t });
      t += spacingPx / segLen;
    }
    // Distance from the last placed point to b — preserve across segments.
    const lastT = (out.length > 0
      ? Math.hypot(out[out.length - 1].x - a.x, out[out.length - 1].y - a.y)
      : 0);
    carry = segLen - lastT;
    if (!Number.isFinite(carry) || carry < 0) carry = 0;
  }
  return out;
}

export type ColorMode =
  | "Warm White"
  | "Cool White"
  | "RGB Demo"
  | "Red/Green Holiday"
  | "Soft Architectural";

/** Map a color mode + index to a CSS rgba string. */
export function colorForBulb(mode: ColorMode, index: number, brightness: number): string {
  const a = Math.max(0.2, Math.min(1, brightness));
  switch (mode) {
    case "Warm White":
      return `rgba(255, 214, 153, ${a})`;
    case "Cool White":
      return `rgba(225, 240, 255, ${a})`;
    case "Soft Architectural":
      return `rgba(255, 198, 130, ${a * 0.9})`;
    case "Red/Green Holiday":
      return index % 2 === 0
        ? `rgba(255, 60, 60, ${a})`
        : `rgba(60, 220, 90, ${a})`;
    case "RGB Demo": {
      const hue = (index * 28) % 360;
      return `hsla(${hue}, 95%, 60%, ${a})`;
    }
  }
}
