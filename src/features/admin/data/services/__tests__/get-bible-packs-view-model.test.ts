import { afterEach, describe, expect, test, vi } from "vitest";
import { getBiblePacksViewModelFromApi } from "@/features/admin/data/services/get-bible-packs-view-model";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const PACKS = [
  {
    code: "bsb",
    kind: "version",
    name: "Berean Standard Bible",
    abbreviation: "BSB",
    description: "Modern English",
    attribution: "Public domain.",
    supports_word_study: true,
    size_bytes: 5865473,
    data_version: 2,
    is_enabled: true,
    is_default: true,
  },
  {
    code: "kjv",
    kind: "version",
    name: "King James Version",
    abbreviation: "KJV",
    supports_word_study: true,
    size_bytes: 5270295,
    data_version: 2,
    is_enabled: true,
    is_default: false,
  },
  {
    code: "study",
    kind: "study",
    name: "Word study & concordance",
    abbreviation: "STUDY",
    size_bytes: 10758488,
    data_version: 1,
    is_enabled: true,
    is_default: false,
  },
];

function stubBackend(packs: unknown[] = PACKS, changes: unknown[] = []) {
  const fetchMock = vi.fn<typeof fetch>((input) =>
    Promise.resolve(jsonResponse({ results: String(input).includes("/changes/") ? changes : packs })),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("getBiblePacksViewModelFromApi", () => {
  test("reads every pack and the change history with the admin's session", async () => {
    const fetchMock = stubBackend(PACKS, [
      { pack_name: "King James Version", action: "made_default", actor_name: "Bible Admin", created_at: "2026-10-13T10:00:00Z" },
    ]);

    const viewModel = await getBiblePacksViewModelFromApi({}, "sessionid=abc");

    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls.some((url) => url.endsWith("/bible/admin/packs/"))).toBe(true);
    expect(urls.some((url) => url.includes("/bible/admin/packs/changes/"))).toBe(true);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { cookie: "sessionid=abc" } });
    expect(viewModel.versions.map((pack) => pack.code)).toEqual(["bsb", "kjv"]);
    expect(viewModel.studyPacks.map((pack) => pack.code)).toEqual(["study"]);
    expect(viewModel.changes).toEqual([
      { packName: "King James Version", action: "made_default", actorName: "Bible Admin", createdAt: "2026-10-13T10:00:00Z" },
    ]);
  });

  test("explains ahead of time what can't be hidden, and why", async () => {
    stubBackend();
    const viewModel = await getBiblePacksViewModelFromApi({}, "");
    const [bsb, kjv] = viewModel.versions;
    const [study] = viewModel.studyPacks;

    expect(bsb.hideBlockedReason).toContain("Make another version the default");
    expect(bsb.canMakeDefault).toBe(false);
    expect(kjv.hideBlockedReason).toBeNull();
    expect(kjv.canMakeDefault).toBe(true);
    expect(study.hideBlockedReason).toBe("Word study is used by BSB, KJV. Readers couldn't look words up without it.");
  });

  test("the only Bible left can't be hidden; a hidden Bible can't be the default", async () => {
    stubBackend([
      { ...PACKS[0], is_default: false },
      { ...PACKS[1], is_enabled: false },
    ]);
    const viewModel = await getBiblePacksViewModelFromApi({}, "");
    expect(viewModel.versions[0].hideBlockedReason).toBe("It's the only Bible readers can download.");
    expect(viewModel.versions[1].canMakeDefault).toBe(false);
  });

  test("a successful action becomes a plain-words banner", async () => {
    stubBackend();
    const viewModel = await getBiblePacksViewModelFromApi({ state: "success", action: "disable", pack: "kjv" }, "");
    expect(viewModel.bannerMessage).toBe(
      "King James Version is hidden from readers. Anyone who already downloaded it keeps it.",
    );
  });

  test("a refused action shows the backend's reason", async () => {
    stubBackend();
    const viewModel = await getBiblePacksViewModelFromApi(
      { state: "refused", pack: "bsb", message: "BSB is the only Bible readers can download, so it has to stay." },
      "",
    );
    expect(viewModel.bannerMessage).toBe("BSB is the only Bible readers can download, so it has to stay.");
  });

  test("asks to confirm hiding only a pack that can be hidden", async () => {
    stubBackend();
    expect((await getBiblePacksViewModelFromApi({ confirm: "hide", code: "kjv" }, "")).confirmHide?.code).toBe("kjv");
    expect((await getBiblePacksViewModelFromApi({ confirm: "hide", code: "bsb" }, "")).confirmHide).toBeNull();
  });

  test("a backend failure shows the error state", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({}, 503))));
    const viewModel = await getBiblePacksViewModelFromApi({}, "");
    expect(viewModel.phaseState).toBe("error");
    expect(viewModel.errorMessage).toContain("could not load the Bible settings");
  });
});
