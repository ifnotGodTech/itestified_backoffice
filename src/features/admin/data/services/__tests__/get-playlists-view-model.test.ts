import { afterEach, describe, expect, test, vi } from "vitest";
import { buildPlaylistsHref, getPlaylistsViewModelFromBackend } from "@/features/admin/data/services/get-playlists-view-model";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPlaylistsViewModelFromBackend", () => {
  test("maps the backend list response into playlist rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              count: 1,
              results: [
                {
                  id: 7,
                  title: "Sunday Favorites",
                  owner_name: "Ada Okafor",
                  owner_email: "ada@example.com",
                  visibility: "shared",
                  item_count: 3,
                  created_at: "2026-08-12T00:00:00Z",
                },
              ],
              next: null,
              previous: null,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
      ),
    );

    const viewModel = await getPlaylistsViewModelFromBackend({});

    expect(viewModel.phaseState).toBe("populated");
    expect(viewModel.rows).toHaveLength(1);
    expect(viewModel.rows[0]).toMatchObject({
      id: 7,
      title: "Sunday Favorites",
      ownerName: "Ada Okafor",
      visibility: "shared",
      itemCount: 3,
    });
    expect(viewModel.sharedCount).toBe(1);
    expect(viewModel.totalCount).toBe(1);
  });

  test("shows an empty state when the backend returns no rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ count: 0, results: [], next: null, previous: null }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
      ),
    );

    const viewModel = await getPlaylistsViewModelFromBackend({});

    expect(viewModel.phaseState).toBe("empty");
    expect(viewModel.rows).toHaveLength(0);
  });

  test("surfaces an error state when the backend list request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({}), { status: 500 }))),
    );

    const viewModel = await getPlaylistsViewModelFromBackend({});

    expect(viewModel.phaseState).toBe("error");
    expect(viewModel.errorMessage).toBeTruthy();
  });

  test("fetches and maps unfiltered detail contents when a view id is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/admin/playlists/9/")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                id: 9,
                title: "Mixed",
                owner_name: "Ada Okafor",
                owner_email: "ada@example.com",
                visibility: "private",
                show_owner_name: true,
                item_count: 2,
                created_at: "2026-08-12T00:00:00Z",
                updated_at: "2026-08-20T00:00:00Z",
                items: [
                  { testimony_id: 1, position: 0, title: "Still Good", testimony_type: "video", is_available: true },
                  { testimony_id: 2, position: 1, title: "Now Gone", testimony_type: "written", is_available: false },
                ],
              }),
              { status: 200, headers: { "content-type": "application/json" } },
            ),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ count: 0, results: [], next: null, previous: null }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );
      }),
    );

    const viewModel = await getPlaylistsViewModelFromBackend({ view: "9" });

    expect(viewModel.detail).not.toBeNull();
    expect(viewModel.detail?.items).toHaveLength(2);
    expect(viewModel.detail?.items[1].isAvailable).toBe(false);
  });

  test("surfaces a detail error when the playlist id does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/admin/playlists/999/")) {
          return Promise.resolve(new Response(JSON.stringify({ message: "Playlist not found." }), { status: 404 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify({ count: 0, results: [], next: null, previous: null }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );
      }),
    );

    const viewModel = await getPlaylistsViewModelFromBackend({ view: "999" });

    expect(viewModel.detail).toBeNull();
    expect(viewModel.detailError).toBeTruthy();
  });
});

describe("buildPlaylistsHref", () => {
  test("builds a bare href with no query string when nothing is set", () => {
    expect(buildPlaylistsHref({})).toBe("/playlists");
  });

  test("includes search, visibility, and view params", () => {
    const href = buildPlaylistsHref({ q: "sunday", visibility: "shared", view: 7 });
    expect(href).toBe("/playlists?q=sunday&visibility=shared&view=7");
  });

  test("omits page when it is 1", () => {
    expect(buildPlaylistsHref({ page: 1 })).toBe("/playlists");
    expect(buildPlaylistsHref({ page: 2 })).toBe("/playlists?page=2");
  });
});
