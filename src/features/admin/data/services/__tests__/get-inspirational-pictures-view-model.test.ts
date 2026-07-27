import { afterEach, describe, expect, test, vi } from "vitest";
import { getInspirationalPicturesViewModelFromApi } from "@/features/admin/data/services/get-inspirational-pictures-view-model";

const emptyPicturesPayload = { count: 0, results: [] };
const categoriesPayload = [{ id: 1, name: "Faith", slug: "faith", description: "", is_active: true }];

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getInspirationalPicturesViewModelFromApi", () => {
  test("the upload screen only fetches categories, not the paginated picture list", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/content/admin/inspirational-pictures/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(jsonResponse(emptyPicturesPayload));
    });
    vi.stubGlobal("fetch", fetchMock);

    const viewModel = await getInspirationalPicturesViewModelFromApi({ screen: "upload" }, "sessionid=abc");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toContain("/content/admin/inspirational-pictures/categories/");
    expect(viewModel.categories).toEqual([
      { id: 1, name: "Faith", slug: "faith", description: "", isActive: true },
    ]);
  });

  test("the list screen fetches both the picture list and categories", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/content/admin/inspirational-pictures/categories/")) {
        return Promise.resolve(jsonResponse(categoriesPayload));
      }
      return Promise.resolve(jsonResponse(emptyPicturesPayload));
    });
    vi.stubGlobal("fetch", fetchMock);

    const viewModel = await getInspirationalPicturesViewModelFromApi({}, "sessionid=abc");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const calledUrls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(calledUrls.some((url) => url.includes("/content/admin/inspirational-pictures/categories/"))).toBe(true);
    expect(calledUrls.some((url) => url.includes("/content/admin/inspirational-pictures/") && !url.includes("categories"))).toBe(true);
    expect(viewModel.categories).toEqual([
      { id: 1, name: "Faith", slug: "faith", description: "", isActive: true },
    ]);
  });
});
