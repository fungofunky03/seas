import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InternalDashboard from "../../../client/src/pages/internal";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <InternalDashboard />
    </QueryClientProvider>,
  );
}

describe("InternalDashboard", () => {
  it("renders fetched validation metrics and formatted signals", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: {
        total: 17,
        roleCounts: { "Crew Lead": 6, Sales: 2 },
        volumeCounts: { "11-25/month": 8, "50+/month": 4 },
        bottleneckCounts: { scheduling: 5, quoting: 3 },
        demoInterest: {
          total: 6,
          lastStepCounts: { service: 1, install: 2 },
          mostClickedStepCounts: { "schedule-call": 4, quote: 2 },
        },
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
      error: null,
    } as never);

    renderDashboard();

    expect(await screen.findByText("17")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("metric-top-demo-interest")).getByText("Schedule Call"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("metric-top-bottleneck")).getByText("Scheduling"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("row-demo-interest-schedule-call")).toHaveTextContent("4");
    expect(screen.getByTestId("row-volume-11-25-month")).toHaveTextContent("8");
  });

  it("falls back to empty-state labels and updates navigation hashes", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: null,
    } as never);

    window.location.hash = "#/internal";
    renderDashboard();

    expect(await screen.findAllByText("None")).toHaveLength(2);
    expect(screen.getByText("No bottleneck signals yet")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-back-to-site"));
    expect(window.location.hash).toBe("#/");

    fireEvent.click(screen.getByTestId("link-quote-generator"));
    expect(window.location.hash).toBe("#/internal/quote-generator");

    fireEvent.click(screen.getByTestId("link-visualizer"));
    expect(window.location.hash).toBe("#/internal/visualizer");
  });
});
