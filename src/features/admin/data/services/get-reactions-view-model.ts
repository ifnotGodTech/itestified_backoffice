import { backendBaseUrl } from "@/core/auth/backend";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  ReactionSetTarget,
  ReactionsAction,
  ReactionsData,
  ReactionsView,
  ReactionsViewModel,
} from "@/features/admin/domain/entities/reactions";

export type ReactionOverviewPayload = {
  max_per_set: number;
  icons: { key: string; emoji: string }[];
  reactions: {
    id: number;
    key: string;
    label: string;
    icon: string;
    emoji: string;
    is_active: boolean;
    in_default_set: boolean;
    categories: string[];
    response_count: number;
  }[];
  default_set: number[];
  categories: { id: number; name: string; is_active: boolean; reaction_ids: number[] }[];
};

export function toReactionsData(payload: ReactionOverviewPayload): ReactionsData {
  return {
    maxPerSet: payload.max_per_set,
    icons: payload.icons,
    reactions: payload.reactions.map((reaction) => ({
      id: reaction.id,
      key: reaction.key,
      label: reaction.label,
      icon: reaction.icon,
      emoji: reaction.emoji,
      isActive: reaction.is_active,
      inDefaultSet: reaction.in_default_set,
      categories: reaction.categories,
      responseCount: reaction.response_count,
    })),
    defaultSet: payload.default_set,
    categories: payload.categories.map((category) => ({
      id: category.id,
      name: category.name,
      isActive: category.is_active,
      reactionIds: category.reaction_ids,
    })),
  };
}

export function normalizeView(value?: string): ReactionsView {
  return value === "sets" ? "sets" : "catalogue";
}

export function normalizeTarget(value?: string): ReactionSetTarget {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : "default";
}

/** The backend request for one page action. */
export function backendRequestFor(action: ReactionsAction): { path: string; method: string; body?: unknown } {
  switch (action.action) {
    case "create":
      return { path: "/testimonies/admin/reactions/", method: "POST", body: { label: action.label, icon: action.icon } };
    case "edit":
      return {
        path: `/testimonies/admin/reactions/${action.id}/`,
        method: "PATCH",
        body: { label: action.label, icon: action.icon },
      };
    case "retire":
    case "restore":
      return { path: `/testimonies/admin/reactions/${action.id}/${action.action}/`, method: "POST" };
    case "set":
      return {
        path: `/testimonies/admin/reaction-sets/${action.target}/`,
        method: "PUT",
        body: { reaction_ids: action.reactionIds },
      };
  }
}

export async function getReactionsViewModelFromApi(
  input: { view?: string; set?: string; fullName?: string },
  cookieHeader: string,
): Promise<ReactionsViewModel> {
  const base: ReactionsViewModel = {
    shell: getAdminShellViewModel({
      activeHref: "/testimonies",
      activeChildHref: "/testimonies/reactions",
      fullName: input.fullName,
    }),
    view: normalizeView(input.view),
    target: normalizeTarget(input.set),
    phaseState: "populated",
    data: null,
  };
  const failed = { ...base, phaseState: "error" as const, errorMessage: "We could not load the reactions right now. Please try again." };
  try {
    const response = await fetch(`${backendBaseUrl}/testimonies/admin/reactions/`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) return failed;
    return { ...base, data: toReactionsData((await response.json()) as ReactionOverviewPayload) };
  } catch {
    return failed;
  }
}
