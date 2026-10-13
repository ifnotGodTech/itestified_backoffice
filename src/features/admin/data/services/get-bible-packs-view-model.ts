import { backendBaseUrl } from "@/core/auth/backend";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  BiblePackChangeRow,
  BiblePackRow,
  BiblePacksState,
  BiblePacksViewModel,
} from "@/features/admin/domain/entities/bible-packs";

type PackPayload = {
  code: string;
  kind: string;
  name: string;
  abbreviation: string;
  description?: string;
  attribution?: string;
  supports_word_study?: boolean;
  size_bytes?: number;
  data_version?: number;
  is_enabled?: boolean;
  is_default?: boolean;
  updated_at?: string | null;
};

type ChangePayload = {
  pack_name?: string;
  action?: string;
  actor_name?: string;
  created_at?: string;
};

const ACTION_DONE: Record<string, (name: string) => string> = {
  enable: (name) => `${name} is now available for readers to download.`,
  disable: (name) => `${name} is hidden from readers. Anyone who already downloaded it keeps it.`,
  "make-default": (name) => `${name} is now the Bible new readers download first.`,
};

function toRow(payload: PackPayload): Omit<BiblePackRow, "hideBlockedReason" | "canMakeDefault"> {
  return {
    code: payload.code,
    kind: payload.kind === "study" ? "study" : "version",
    name: payload.name,
    abbreviation: payload.abbreviation,
    description: payload.description ?? "",
    attribution: payload.attribution ?? "",
    supportsWordStudy: Boolean(payload.supports_word_study),
    sizeBytes: Number(payload.size_bytes ?? 0),
    dataVersion: Number(payload.data_version ?? 1),
    isEnabled: Boolean(payload.is_enabled),
    isDefault: Boolean(payload.is_default),
    updatedAt: payload.updated_at ?? null,
  };
}

/** The same rules the backend enforces, worked out ahead so the page can
 * explain why a button is unavailable before anyone presses it. */
export function withGuards(rows: Omit<BiblePackRow, "hideBlockedReason" | "canMakeDefault">[]): BiblePackRow[] {
  const shownVersions = rows.filter((row) => row.kind === "version" && row.isEnabled);
  return rows.map((row) => {
    let hideBlockedReason: string | null = null;
    if (row.isEnabled) {
      if (row.isDefault) {
        hideBlockedReason = "New readers download this Bible first. Make another version the default before hiding it.";
      } else if (row.kind === "version" && shownVersions.length <= 1) {
        hideBlockedReason = "It's the only Bible readers can download.";
      } else if (row.kind === "study") {
        const needing = shownVersions.filter((version) => version.supportsWordStudy).map((version) => version.abbreviation);
        if (needing.length > 0) {
          hideBlockedReason = `Word study is used by ${needing.join(", ")}. Readers couldn't look words up without it.`;
        }
      }
    }
    return {
      ...row,
      hideBlockedReason,
      canMakeDefault: row.kind === "version" && row.isEnabled && !row.isDefault,
    };
  });
}

function toChange(payload: ChangePayload): BiblePackChangeRow {
  const action = payload.action === "enabled" || payload.action === "disabled" ? payload.action : "made_default";
  return {
    packName: payload.pack_name ?? "",
    action,
    actorName: payload.actor_name || "An admin",
    createdAt: payload.created_at ?? "",
  };
}

function normalizeState(state?: string): BiblePacksState {
  return state === "success" || state === "refused" || state === "error" ? state : "populated";
}

export async function getBiblePacksViewModelFromApi(
  input: {
    state?: string;
    action?: string;
    pack?: string;
    message?: string;
    confirm?: string;
    code?: string;
    fullName?: string;
  },
  cookieHeader: string,
): Promise<BiblePacksViewModel> {
  const phaseState = normalizeState(input.state);
  const base: BiblePacksViewModel = {
    shell: getAdminShellViewModel({ activeHref: "/bible-packs", fullName: input.fullName }),
    phaseState,
    versions: [],
    studyPacks: [],
    changes: [],
    confirmHide: null,
  };

  const headers: Record<string, string> = cookieHeader ? { cookie: cookieHeader } : {};
  try {
    const [packsRes, changesRes] = await Promise.all([
      fetch(`${backendBaseUrl}/bible/admin/packs/`, { headers, cache: "no-store" }),
      fetch(`${backendBaseUrl}/bible/admin/packs/changes/?page_size=10`, { headers, cache: "no-store" }),
    ]);
    if (!packsRes.ok || !changesRes.ok) {
      return { ...base, phaseState: "error", errorMessage: "We could not load the Bible settings right now. Please try again." };
    }
    const packsBody = (await packsRes.json()) as { results?: PackPayload[] };
    const changesBody = (await changesRes.json()) as { results?: ChangePayload[] };
    const rows = withGuards((packsBody.results ?? []).map(toRow));

    const named = rows.find((row) => row.code === input.pack)?.name ?? input.pack ?? "";
    let bannerMessage: string | undefined;
    if (phaseState === "success" && input.action && ACTION_DONE[input.action]) {
      bannerMessage = ACTION_DONE[input.action](named);
    } else if (phaseState === "refused") {
      bannerMessage = input.message || "That change wasn't made.";
    } else if (phaseState === "error") {
      bannerMessage = "Something went wrong. Please try again.";
    }

    const confirmHide =
      input.confirm === "hide"
        ? (rows.find((row) => row.code === input.code && row.isEnabled && row.hideBlockedReason === null) ?? null)
        : null;

    return {
      ...base,
      versions: rows.filter((row) => row.kind === "version"),
      studyPacks: rows.filter((row) => row.kind === "study"),
      changes: (changesBody.results ?? []).map(toChange),
      confirmHide,
      bannerMessage,
    };
  } catch {
    return { ...base, phaseState: "error", errorMessage: "We could not load the Bible settings right now. Please try again." };
  }
}
