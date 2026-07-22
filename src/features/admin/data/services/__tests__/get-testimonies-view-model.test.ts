import { afterEach, describe, expect, test, vi } from "vitest";
import { getTestimoniesViewModelFromBackend } from "@/features/admin/data/services/get-testimonies-view-model";

const emptyTestimoniesPayload = { count: 0, results: [] };
const categoriesPayload = [
  { id: 1, name: "Healing", slug: "healing", description: "", is_active: true },
];

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getTestimoniesViewModelFromBackend", () => {
  test("requests only video testimonies for the video tab", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/testimonies/admin/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(jsonResponse(emptyTestimoniesPayload));
    });
    vi.stubGlobal("fetch", fetchMock);

    await getTestimoniesViewModelFromBackend({ tab: "video", cookieHeader: "sessionid=video-tab" });

    const testimonyUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(testimonyUrl.searchParams.get("testimony_type")).toBe("video");
    expect(testimonyUrl.searchParams.get("page_size")).toBe("20");
  });

  test("uses backend count in the showing label when the page is partial", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/testimonies/admin/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(
        jsonResponse({
          count: 42,
          results: [
            {
              id: 7,
              title: "Partial page testimony",
              testimony_type: "written",
              status: "approved",
              author_name: "Ada Admin",
              author_email: "ada@example.com",
              category: "Healing",
              view_count: 0,
              comment_count: 0,
              created_at: "2026-07-22T10:00:00Z",
              body: "A short testimony.",
            },
          ],
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const viewModel = await getTestimoniesViewModelFromBackend({
      tab: "text",
      cookieHeader: "sessionid=partial-page",
    });

    expect(viewModel.rows).toHaveLength(1);
    expect(viewModel.totalRows).toBe(42);
    expect(viewModel.showingLabel).toBe("Showing 1-1 of 42");
  });

  test("reuses cached categories for the same admin session", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/testimonies/admin/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(jsonResponse(emptyTestimoniesPayload));
    });
    vi.stubGlobal("fetch", fetchMock);

    await getTestimoniesViewModelFromBackend({ tab: "text", cookieHeader: "sessionid=category-cache" });
    await getTestimoniesViewModelFromBackend({ tab: "video", cookieHeader: "sessionid=category-cache" });

    const categoryFetches = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/testimonies/admin/categories/"),
    );
    const testimonyFetches = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/testimonies/admin/testimonies/"),
    );

    expect(categoryFetches).toHaveLength(1);
    expect(testimonyFetches).toHaveLength(2);
  });
});
