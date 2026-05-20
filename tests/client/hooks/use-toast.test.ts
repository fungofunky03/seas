import { describe, expect, it, vi } from "vitest";
import { reducer } from "../../../client/src/hooks/use-toast";

describe("toast reducer", () => {
  it("keeps only the latest toast when adding more than the limit", () => {
    const first = reducer(
      { toasts: [] },
      { type: "ADD_TOAST", toast: { id: "1", title: "One", open: true } },
    );
    const second = reducer(first, {
      type: "ADD_TOAST",
      toast: { id: "2", title: "Two", open: true },
    });

    expect(second.toasts).toHaveLength(1);
    expect(second.toasts[0]).toMatchObject({ id: "2", title: "Two" });
  });

  it("updates matching toasts in place", () => {
    const state = reducer(
      { toasts: [] },
      { type: "ADD_TOAST", toast: { id: "1", title: "Before", open: true } },
    );

    const updated = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "After" },
    });

    expect(updated.toasts[0]).toMatchObject({ id: "1", title: "After", open: true });
  });

  it("marks dismissed toasts as closed and can remove all toasts", () => {
    vi.useFakeTimers();

    const dismissed = reducer(
      {
        toasts: [
          { id: "1", title: "One", open: true },
          { id: "2", title: "Two", open: true },
        ],
      },
      { type: "DISMISS_TOAST" },
    );

    expect(dismissed.toasts.every((toast) => toast.open === false)).toBe(true);
    expect(reducer(dismissed, { type: "REMOVE_TOAST" }).toasts).toEqual([]);

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});
