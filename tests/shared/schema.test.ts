import { describe, expect, it } from "vitest";
import { insertWaitlistSchema } from "../../shared/schema";

const validPayload = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "North Star Lighting",
  role: "Dealer/Owner" as const,
  installVolume: "11-25/month" as const,
};

describe("insertWaitlistSchema", () => {
  it("applies defaults for optional tracking fields", () => {
    expect(insertWaitlistSchema.parse(validPayload)).toEqual({
      ...validPayload,
      bottleneck: "",
      demoLastStep: "",
      demoMostClickedStep: "",
      demoStepClicks: {},
    });
  });

  it("rejects invalid contact and enum values", () => {
    const result = insertWaitlistSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
      role: "Installer",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toContain("Enter a valid work email");
    expect(result.error?.flatten().fieldErrors.role).toBeTruthy();
  });

  it("rejects oversized bottleneck text and non-numeric click counts", () => {
    const result = insertWaitlistSchema.safeParse({
      ...validPayload,
      bottleneck: "x".repeat(2001),
      demoStepClicks: { quote: 2, schedule: "3" },
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.bottleneck).toBeTruthy();
    expect(result.error?.flatten().fieldErrors.demoStepClicks).toBeTruthy();
  });
});
