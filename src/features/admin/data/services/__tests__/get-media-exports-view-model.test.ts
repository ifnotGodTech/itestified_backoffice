import { afterEach, describe, expect, test, vi } from "vitest";
import { getMediaExportsViewModelFromApi } from "@/features/admin/data/services/get-media-exports-view-model";

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getMediaExportsViewModelFromApi", () => {
  test("maps default_logo_url alongside logo_url so the dashboard can offer both as real options", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/media-exports/admin/branding/")) {
        return Promise.resolve(
          jsonResponse({
            id: 1,
            logo_url: "",
            default_logo_url: "https://res.cloudinary.com/itestified/image/upload/itestified/branding/default-logo.png",
            watermark_text: "From iTestified",
            call_to_action: "Get the app",
            end_card_url: "",
            is_enabled: true,
            version: 1,
            updated_by: null,
            updated_at: null,
          }),
        );
      }
      return Promise.resolve(jsonResponse({ count: 0, results: [] }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const viewModel = await getMediaExportsViewModelFromApi({}, "sessionid=ok");

    expect(viewModel.branding.logoUrl).toBe("");
    expect(viewModel.branding.defaultLogoUrl).toBe(
      "https://res.cloudinary.com/itestified/image/upload/itestified/branding/default-logo.png",
    );
  });

  test("a custom logo_url is preserved distinctly from the default", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("/media-exports/admin/branding/")) {
        return Promise.resolve(
          jsonResponse({
            id: 1,
            logo_url: "https://res.cloudinary.com/itestified/image/upload/itestified/branding/custom-logo.png",
            default_logo_url: "https://res.cloudinary.com/itestified/image/upload/itestified/branding/default-logo.png",
            watermark_text: "From iTestified",
            call_to_action: "Get the app",
            end_card_url: "",
            is_enabled: true,
            version: 2,
            updated_by: 4,
            updated_at: "2026-08-23T00:00:00Z",
          }),
        );
      }
      return Promise.resolve(jsonResponse({ count: 0, results: [] }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const viewModel = await getMediaExportsViewModelFromApi({}, "sessionid=ok");

    expect(viewModel.branding.logoUrl).toContain("custom-logo");
    expect(viewModel.branding.defaultLogoUrl).toContain("default-logo");
  });
});
