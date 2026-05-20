import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, getQueryFn } from "../../../client/src/lib/queryClient";

describe("query client helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON bodies for API requests", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiRequest("POST", "/api/test", { answer: 42 });

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: 42 }),
    });
  });

  it("throws the response status and text when a request fails", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response("boom", { status: 500, statusText: "Server Error" }));

    await expect(apiRequest("GET", "/api/fail")).rejects.toThrow("500: boom");
  });

  it("returns null for 401 responses when configured to do so", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const queryFn = getQueryFn<{ ok: boolean }>({ on401: "returnNull" });

    await expect(queryFn({ queryKey: ["/secure"] } as never)).resolves.toBeNull();
  });

  it("joins query keys into the request path and returns parsed JSON", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ count: 3 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const queryFn = getQueryFn<{ count: number }>({ on401: "throw" });

    await expect(queryFn({ queryKey: ["/waitlist", "count"] } as never)).resolves.toEqual({
      count: 3,
    });
    expect(fetchMock).toHaveBeenCalledWith("/waitlist/count");
  });
});
