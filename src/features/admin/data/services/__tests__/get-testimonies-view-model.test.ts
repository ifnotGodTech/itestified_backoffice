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

  test("forwards admin testimony filters to the backend list request", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/testimonies/admin/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(jsonResponse(emptyTestimoniesPayload));
    });
    vi.stubGlobal("fetch", fetchMock);

    await getTestimoniesViewModelFromBackend({
      tab: "video",
      videoStatus: "Uploaded",
      category: "healing",
      source: "YouTube",
      from: "01/01/2026",
      to: "31/12/2026",
      q: "healed",
      cookieHeader: "sessionid=filters",
    });

    const testimonyUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(testimonyUrl.searchParams.get("testimony_type")).toBe("video");
    expect(testimonyUrl.searchParams.get("status")).toBe("approved");
    expect(testimonyUrl.searchParams.get("category")).toBe("healing");
    expect(testimonyUrl.searchParams.get("source")).toBe("YouTube");
    expect(testimonyUrl.searchParams.get("date_from")).toBe("01/01/2026");
    expect(testimonyUrl.searchParams.get("date_to")).toBe("31/12/2026");
    expect(testimonyUrl.searchParams.get("search")).toBe("healed");
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

  test("maps video source from the backend testimony body", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/testimonies/admin/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(
        jsonResponse({
          count: 1,
          results: [
            {
              id: 8,
              title: "Video source testimony",
              testimony_type: "video",
              status: "approved",
              author_name: "Video Admin",
              author_email: "video@example.com",
              category: "Healing",
              view_count: 0,
              comment_count: 0,
              created_at: "2026-07-22T10:00:00Z",
              body: "A video testimony.\nSource: youtube",
              source: "Youtube",
              video_url: "https://res.cloudinary.com/demo/video/upload/v1/video.mp4",
            },
          ],
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const viewModel = await getTestimoniesViewModelFromBackend({
      tab: "video",
      cookieHeader: "sessionid=source-map",
    });

    expect(viewModel.rows[0]).toMatchObject({ kind: "video", source: "YouTube" });
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
