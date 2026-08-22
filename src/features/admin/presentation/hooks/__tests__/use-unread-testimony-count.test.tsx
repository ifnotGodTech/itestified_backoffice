import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useUnreadTestimonyCount } from "@/features/admin/presentation/hooks/use-unread-testimony-count";

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

function stubFetchReturning(count: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ count }), { status: 200, headers: { "content-type": "application/json" } }),
      ),
    ),
  );
}

// Captures the value from every render pass, in order -- unlike checking
// result.current after renderHook() (which can already reflect a flushed
// effect by the time it returns), this records what the very first,
// pre-effect render actually saw.
function TestProbe({ onRender }: { onRender: (count: number) => void }) {
  const count = useUnreadTestimonyCount();
  onRender(count);
  return null;
}

describe("useUnreadTestimonyCount", () => {
  // Regression coverage: a lazy useState(readCachedUnreadCount) initializer
  // used to read sessionStorage on the client's very first render, which
  // doesn't exist during SSR -- the server always rendered 0/no-badge while
  // the client could immediately render a cached non-zero count, a real
  // hydration mismatch a user hit live on the notifications nav badge.
  test("the first render is 0 even when a non-zero count is already cached, matching what the server rendered", async () => {
    window.sessionStorage.setItem("adminUnreadTestimonyCount", "7");
    window.sessionStorage.setItem("adminUnreadTestimonyCountAt", String(Date.now()));
    stubFetchReturning(7);
    const renderedValues: number[] = [];

    render(<TestProbe onRender={(count) => renderedValues.push(count)} />);

    expect(renderedValues[0]).toBe(0);
    await waitFor(() => expect(renderedValues.at(-1)).toBe(7));
  });

  test("with nothing cached, fetches and reflects the real unread count", async () => {
    stubFetchReturning(3);
    const renderedValues: number[] = [];

    render(<TestProbe onRender={(count) => renderedValues.push(count)} />);

    expect(renderedValues[0]).toBe(0);
    await waitFor(() => expect(renderedValues.at(-1)).toBe(3));
  });
});
