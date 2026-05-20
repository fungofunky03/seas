import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "../../../client/src/pages/home";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

function renderHome() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <Home />
    </QueryClientProvider>,
  );
}

describe("Home", () => {
  it("renders the landing page and the live waitlist count banner", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: 7,
      error: null,
    } as never);

    renderHome();

    expect(screen.getByTestId("text-hero-headline")).toHaveTextContent(
      "Run permanent lighting jobs without the text-thread chaos.",
    );
    expect(await screen.findByTestId("status-waitlist-count")).toHaveTextContent(
      "7 installers have joined the validation list.",
    );
  });
});
