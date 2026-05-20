import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuoteGenerator from "../../../client/src/pages/quote-generator";

describe("QuoteGenerator", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("builds a proposal from the current quote state and supports reset/navigation", async () => {
    window.location.hash = "#/internal/quote-generator";
    render(<QuoteGenerator />);

    const customerName = screen.getByTestId("input-customer-name");
    fireEvent.change(customerName, { target: { value: "Beacon Residence" } });

    fireEvent.click(screen.getByTestId("button-copy-proposal"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("Customer: Beacon Residence"),
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("SEAS PROPOSAL — Trimlight"),
    );
    expect(screen.getByTestId("text-margin-vs-target")).toHaveTextContent("/ 38%");

    fireEvent.click(screen.getByTestId("button-open-visualizer"));
    expect(window.location.hash).toBe("#/internal/visualizer");

    fireEvent.click(screen.getByTestId("button-reset"));
    expect(screen.getByTestId("input-customer-name")).toHaveValue("Hartwell Residence");
  });
});
