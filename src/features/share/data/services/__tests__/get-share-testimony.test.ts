import { afterEach, describe, expect, test, vi } from "vitest";
import { getShareTestimony } from "@/features/share/data/services/get-share-testimony";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getShareTestimony", () => {
  test("maps the backend's snake_case share payload to the view entity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({
            id: 42,
            title: "God healed me",
            testimony_type: "written",
            category: "Healing",
            body: "The full story.",
            pull_quote: "God healed me after prayer.",
            video_url: "",
            thumbnail_url: "",
          }),
        ),
      ),
    );

    const testimony = await getShareTestimony("42");

    expect(testimony).toEqual({
      id: 42,
      title: "God healed me",
      testimonyType: "written",
      category: "Healing",
      body: "The full story.",
      pullQuote: "God healed me after prayer.",
      videoUrl: "",
      thumbnailUrl: "",
    });
  });

  // The privacy fix this endpoint exists for: the payload the backend sends
  // has no author field at all, so there is nothing here that could ever
  // leak a name or email onto a crawler-indexed public page.
  test("the mapped result never carries an author field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({
            id: 1,
            title: "Testimony",
            testimony_type: "written",
            category: "Faith",
            body: "Body",
            pull_quote: "",
            video_url: "",
            thumbnail_url: "",
          }),
        ),
      ),
    );

    const testimony = await getShareTestimony("1");

    expect(testimony).not.toHaveProperty("author");
    expect(testimony).not.toHaveProperty("authorName");
    expect(testimony).not.toHaveProperty("authorEmail");
  });

  test("returns null when the backend responds 404 (unapproved, deleted, or unknown id)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ detail: "Not found." }, 404))),
    );

    const testimony = await getShareTestimony("999");

    expect(testimony).toBeNull();
  });
});
