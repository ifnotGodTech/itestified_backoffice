import { describe, expect, it } from "vitest";
import {
  backendRequestFor,
  normalizeTarget,
  normalizeView,
  toReactionsData,
  type ReactionOverviewPayload,
} from "@/features/admin/data/services/get-reactions-view-model";

const payload: ReactionOverviewPayload = {
  max_per_set: 4,
  icons: [{ key: "handshake", emoji: "🤝" }],
  reactions: [
    {
      id: 4,
      key: "pray_with_me",
      label: "Pray with me",
      icon: "handshake",
      emoji: "🤝",
      is_active: true,
      in_default_set: false,
      categories: ["Healing"],
      response_count: 611,
    },
  ],
  default_set: [1, 2, 3],
  categories: [
    { id: 7, name: "Healing", is_active: true, reaction_ids: [4] },
    { id: 8, name: "Faith", is_active: true, reaction_ids: [] },
  ],
};

describe("reactions view model", () => {
  it("maps the backend overview to the page's shape", () => {
    const data = toReactionsData(payload);

    expect(data.maxPerSet).toBe(4);
    expect(data.reactions[0]).toEqual({
      id: 4,
      key: "pray_with_me",
      label: "Pray with me",
      icon: "handshake",
      emoji: "🤝",
      isActive: true,
      inDefaultSet: false,
      categories: ["Healing"],
      responseCount: 611,
    });
    expect(data.defaultSet).toEqual([1, 2, 3]);
    expect(data.categories[1]).toEqual({ id: 8, name: "Faith", isActive: true, reactionIds: [] });
  });

  it("reads the view and the set being edited from the address", () => {
    expect(normalizeView("sets")).toBe("sets");
    expect(normalizeView(undefined)).toBe("catalogue");
    expect(normalizeTarget("7")).toBe(7);
    expect(normalizeTarget("default")).toBe("default");
    expect(normalizeTarget("-3")).toBe("default");
    expect(normalizeTarget(undefined)).toBe("default");
  });

  it("turns each page action into its backend request", () => {
    expect(backendRequestFor({ action: "create", label: "Peace to you", icon: "dove" })).toEqual({
      path: "/testimonies/admin/reactions/",
      method: "POST",
      body: { label: "Peace to you", icon: "dove" },
    });
    expect(backendRequestFor({ action: "edit", id: 4, label: "Praying with you", icon: "pray" }).method).toBe("PATCH");
    expect(backendRequestFor({ action: "retire", id: 4 }).path).toBe("/testimonies/admin/reactions/4/retire/");
    expect(backendRequestFor({ action: "restore", id: 4 }).path).toBe("/testimonies/admin/reactions/4/restore/");
    expect(backendRequestFor({ action: "set", target: 7, reactionIds: [4, 5] })).toEqual({
      path: "/testimonies/admin/reaction-sets/7/",
      method: "PUT",
      body: { reaction_ids: [4, 5] },
    });
    expect(backendRequestFor({ action: "set", target: "default", reactionIds: [1] }).path).toBe(
      "/testimonies/admin/reaction-sets/default/",
    );
  });
});
