import { backendBaseUrl } from "@/core/auth/backend";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { formatShowingLabel, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  PlaylistDetail,
  PlaylistItemRow,
  PlaylistRow,
  PlaylistVisibility,
  PlaylistsViewModel,
} from "@/features/admin/domain/entities/playlists";

// Unlike most other admin view-model services in this app, there is no
// mock-fixture base to preserve here -- Phase 29's backend shipped fully
// built and tested before this dashboard work started, so there was never
// a "mock screens first, wire later" phase to carry forward. This function
// goes straight to the real API.

function mapRow(item: Record<string, unknown>): PlaylistRow {
  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? ""),
    ownerName: String(item.owner_name ?? ""),
    ownerEmail: String(item.owner_email ?? ""),
    visibility: item.visibility === "shared" ? "shared" : "private",
    itemCount: Number(item.item_count ?? 0),
    createdAt: toDateLabel(String(item.created_at ?? "")),
  };
}

function mapItem(item: Record<string, unknown>): PlaylistItemRow {
  const testimonyType = String(item.testimony_type ?? "written");
  return {
    testimonyId: Number(item.testimony_id ?? 0),
    position: Number(item.position ?? 0),
    title: String(item.title ?? ""),
    testimonyType: testimonyType === "video" || testimonyType === "audio" ? testimonyType : "written",
    isAvailable: item.is_available !== false,
  };
}

function mapDetail(item: Record<string, unknown>): PlaylistDetail {
  const rawItems = Array.isArray(item.items) ? (item.items as Array<Record<string, unknown>>) : [];
  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? ""),
    ownerName: String(item.owner_name ?? ""),
    ownerEmail: String(item.owner_email ?? ""),
    visibility: item.visibility === "shared" ? "shared" : "private",
    showOwnerName: Boolean(item.show_owner_name),
    itemCount: Number(item.item_count ?? 0),
    createdAt: toDateLabel(String(item.created_at ?? "")),
    updatedAt: toDateLabel(String(item.updated_at ?? "")),
    items: rawItems.map(mapItem),
  };
}

function toDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function normalizeVisibilityFilter(value?: string): PlaylistVisibility | "" {
  return value === "shared" || value === "private" ? value : "";
}

export function buildPlaylistsHref(params: {
  q?: string;
  visibility?: PlaylistVisibility | "";
  page?: number;
  view?: number;
  takedown?: number;
}): string {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.visibility) searchParams.set("visibility", params.visibility);
  if (params.page && params.page > 1) searchParams.set("page", String(params.page));
  if (params.view) searchParams.set("view", String(params.view));
  if (params.takedown) searchParams.set("takedown", String(params.takedown));
  const query = searchParams.toString();
  return `/playlists${query ? `?${query}` : ""}`;
}

export async function getPlaylistsViewModelFromBackend(input: {
  q?: string;
  visibility?: string;
  page?: string;
  view?: string;
  takedown?: string;
  fullName?: string;
  cookieHeader?: string;
}): Promise<PlaylistsViewModel> {
  const page = parsePageParam(input.page);
  const searchQuery = input.q?.trim() ?? "";
  const visibilityFilter = normalizeVisibilityFilter(input.visibility);
  const shell = getAdminShellViewModel({ activeHref: "/playlists", fullName: input.fullName });
  const cookieHeaders: Record<string, string> = input.cookieHeader ? { cookie: input.cookieHeader } : {};

  const listParams = new URLSearchParams();
  if (searchQuery) listParams.set("q", searchQuery);
  if (visibilityFilter) listParams.set("visibility", visibilityFilter);
  listParams.set("page", String(page));

  const viewId = Number(input.view ?? input.takedown ?? "");
  const shouldFetchDetail = Number.isFinite(viewId) && viewId > 0;

  try {
    const [listResponse, detailResponse] = await Promise.all([
      fetch(`${backendBaseUrl}/playlists/admin/playlists/?${listParams.toString()}`, {
        headers: cookieHeaders,
        cache: "no-store",
      }),
      shouldFetchDetail
        ? fetch(`${backendBaseUrl}/playlists/admin/playlists/${viewId}/`, {
            headers: cookieHeaders,
            cache: "no-store",
          })
        : Promise.resolve(null),
    ]);

    if (!listResponse.ok) {
      return {
        shell,
        phaseState: "error",
        errorMessage: "We could not load playlists right now. Please try again.",
        searchQuery,
        visibilityFilter,
        rows: [],
        showingLabel: "Showing 0 of 0",
        totalCount: 0,
        sharedCount: 0,
        page,
        hasNextPage: false,
        hasPreviousPage: page > 1,
        detail: null,
        showTakedownModal: false,
      };
    }

    const listPayload = (await listResponse.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
    };
    const rawResults = listPayload.results ?? [];
    const rows = rawResults.map(mapRow);
    const totalCount = listPayload.count ?? rows.length;
    const sharedCount = rows.filter((row) => row.visibility === "shared").length;

    let detail: PlaylistDetail | null = null;
    let detailError: string | undefined;
    if (shouldFetchDetail && detailResponse) {
      if (detailResponse.ok) {
        detail = mapDetail((await detailResponse.json().catch(() => ({}))) as Record<string, unknown>);
      } else {
        detailError = "This playlist could not be found.";
      }
    }

    return {
      shell,
      phaseState: rows.length === 0 ? "empty" : "populated",
      searchQuery,
      visibilityFilter,
      rows,
      showingLabel: formatShowingLabel(page, rows.length, totalCount),
      totalCount,
      sharedCount,
      page,
      hasNextPage: Boolean(listPayload.next),
      hasPreviousPage: Boolean(listPayload.previous) || page > 1,
      detail,
      detailError,
      showTakedownModal: Boolean(input.takedown),
    };
  } catch {
    return {
      shell,
      phaseState: "error",
      errorMessage: "We could not load playlists right now. Please try again.",
      searchQuery,
      visibilityFilter,
      rows: [],
      showingLabel: "Showing 0 of 0",
      totalCount: 0,
      sharedCount: 0,
      page,
      hasNextPage: false,
      hasPreviousPage: page > 1,
      detail: null,
      showTakedownModal: false,
    };
  }
}
