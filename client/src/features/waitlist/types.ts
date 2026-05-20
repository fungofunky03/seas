export type DemoStepKey = "quote" | "schedule" | "install" | "service";

export type DemoEngagement = {
  demoLastStep: string;
  demoMostClickedStep: string;
  demoStepClicks: Record<string, number>;
};
