import { describe, expect, it, vi } from "vitest";
import {
  colorForBulb,
  detectSoffitLine,
  sampleAlongPolyline,
} from "../../../client/src/lib/visualizer";

describe("sampleAlongPolyline", () => {
  it("returns evenly spaced points for a straight segment", () => {
    const points = sampleAlongPolyline(
      [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
      ],
      100,
      100,
      30,
    );

    expect(points).toHaveLength(4);
    expect(points.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))).toEqual([
      { x: 0, y: 50 },
      { x: 30, y: 50 },
      { x: 60, y: 50 },
      { x: 90, y: 50 },
    ]);
  });

  it("preserves spacing across segment boundaries", () => {
    expect(
      sampleAlongPolyline(
        [
          { x: 0, y: 0 },
          { x: 0.5, y: 0 },
          { x: 1, y: 0 },
        ],
        100,
        100,
        40,
      ),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 80, y: 0 },
    ]);
  });

  it("returns no points for invalid inputs", () => {
    expect(sampleAlongPolyline([{ x: 0, y: 0 }], 100, 100, 20)).toEqual([]);
    expect(
      sampleAlongPolyline(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        100,
        100,
        0,
      ),
    ).toEqual([]);
  });
});

describe("colorForBulb", () => {
  it("clamps warm white brightness to the minimum alpha", () => {
    expect(colorForBulb("Warm White", 0, 0)).toBe("rgba(255, 214, 153, 0.2)");
  });

  it("alternates red and green holiday bulbs", () => {
    expect(colorForBulb("Red/Green Holiday", 0, 0.6)).toBe("rgba(255, 60, 60, 0.6)");
    expect(colorForBulb("Red/Green Holiday", 1, 0.6)).toBe("rgba(60, 220, 90, 0.6)");
  });

  it("caps rgb demo brightness at full opacity", () => {
    expect(colorForBulb("RGB Demo", 3, 4)).toBe("hsla(84, 95%, 60%, 1)");
  });
});

describe("detectSoffitLine", () => {
  it("returns a low-confidence empty result when canvas context is unavailable", async () => {
    const createElementSpy = vi.spyOn(document, "createElement");
    createElementSpy.mockReturnValue({
      getContext: () => null,
    } as unknown as HTMLCanvasElement);

    await expect(detectSoffitLine({} as HTMLImageElement)).resolves.toEqual({
      points: [],
      confidence: "Low",
      score: 0,
    });
  });
});
