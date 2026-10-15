import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  HomeManagementAvailablePicture,
  HomeManagementDisplayRule,
  HomeManagementFeaturedPicture,
  HomeManagementPhaseState,
  HomeManagementRow,
  HomeManagementViewModel,
} from "@/features/admin/domain/entities/home-management";

// Phase 35: this page now manages only the featured pictures woven into the
// app's Home feed (the featured testimonies and section order were retired).
// Pictures track no engagement metric, so "Most Recent" is the only rule.
const DISPLAY_RULE_OPTIONS: HomeManagementDisplayRule[] = ["Most Recent"];

// Sample rows for the page's static render and tests; the real page loads
// from the backend via getHomeManagementViewModelFromApi.
const pictureRows: HomeManagementRow[] = [
  {
    id: 1,
    kind: "picture",
    title: "Deeply Loved",
    category: "Inspirational",
    source: "Instagram.com",
    dateUploaded: "08/08/2024",
    uploadedBy: "Elvis/Super Admin",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 8,
    downloads: 32,
    thumbnailLabel: "Deeply Loved by Jesus",
    status: "Uploaded",
  },
  {
    id: 2,
    kind: "picture",
    title: "Grace Note",
    category: "Inspirational",
    source: "Instagram.com",
    dateUploaded: "11/08/2024",
    uploadedBy: "Elvis/Super Admin",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 16,
    downloads: 14,
    thumbnailLabel: "Grace Note",
    status: "Uploaded",
  },
];

function normalizePhaseState(value?: string): HomeManagementPhaseState {
  if (value === "loading" || value === "empty" || value === "error") return value;
  return "populated";
}

function normalizeCount(value: string | undefined, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return max;
  return Math.min(Math.max(1, Math.floor(parsed)), max);
}

export function sortFeaturedPicturesByRule(items: HomeManagementFeaturedPicture[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getHomeManagementViewModel(input: {
  /** Ignored: kept so old links (?tab=video, ?rule=Trending) still open the page. */
  tab?: string;
  rule?: string;
  count?: string;
  state?: string;
  fullName?: string;
  menuId?: string;
  viewId?: string;
  removeId?: string;
  success?: string;
}): HomeManagementViewModel {
  const phaseState = normalizePhaseState(input.state);
  const count = normalizeCount(input.count, pictureRows.length);
  const rows = phaseState === "populated" ? pictureRows.slice(0, count) : [];
  const selectedId = Number(input.menuId ?? input.viewId ?? input.removeId ?? "");
  const selectedRow = Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/home-management",
      fullName: input.fullName,
    }),
    activeTab: "pictures",
    phaseState,
    displayRule: "Most Recent",
    displayRuleOptions: DISPLAY_RULE_OPTIONS,
    testimonyCount: count,
    availableCount: pictureRows.length,
    errorMessage: phaseState === "error" ? "We could not load homepage content right now. Please try again." : undefined,
    rows,
    selectedRow,
    showActionMenu: Boolean(input.menuId),
    showDetails: Boolean(input.viewId),
    showRemoveConfirm: Boolean(input.removeId),
    showSuccess: input.success === "remove",
    featuredPictureOrder: pictureRows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: new Date().toISOString(),
    })),
    availablePictures: [],
  };
}

function formatIsoDate(input: string | null | undefined): string {
  if (!input) return "";
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB");
}

export async function getHomeManagementViewModelFromApi(
  input: {
    tab?: string;
    rule?: string;
    count?: string;
    state?: string;
    fullName?: string;
    menuId?: string;
    viewId?: string;
    removeId?: string;
    success?: string;
  },
  cookieHeader: string,
): Promise<HomeManagementViewModel> {
  try {
    const curationResponse = await fetch(`${backendBaseUrl}/content/admin/home-curation/`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!curationResponse.ok) {
      return getHomeManagementViewModel({ ...input, state: "error" });
    }

    const curationPayload = (await curationResponse.json()) as Record<string, unknown>;
    const vm = getHomeManagementViewModel(input);
    const featuredPictures = (curationPayload.featured_pictures as Array<Record<string, unknown>> | undefined) ?? [];

    const rows: HomeManagementRow[] = featuredPictures.map((item, index) => ({
      id: Number(item.picture_id ?? index + 1),
      kind: "picture",
      title: String(item.title ?? ""),
      category: String(item.category ?? ""),
      source: String(item.source ?? ""),
      dateUploaded: formatIsoDate(String(item.created_at ?? "")),
      uploadedBy: "Content Admin",
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      downloads: 0,
      thumbnailLabel: String(item.title ?? ""),
      thumbnailSrc: String(item.image_url ?? "") || undefined,
      status: "Uploaded",
    }));
    const selectedId = Number(input.menuId ?? input.viewId ?? input.removeId ?? "");
    const selectedRow = Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;

    const featuredPictureOrder: HomeManagementFeaturedPicture[] = featuredPictures.map((item) => ({
      id: Number(item.picture_id ?? 0),
      title: String(item.title ?? ""),
      createdAt: String(item.created_at ?? ""),
    }));
    const availablePictures: HomeManagementAvailablePicture[] = (
      (curationPayload.available_pictures as Array<Record<string, unknown>> | undefined) ?? []
    ).map((item) => ({
      id: Number(item.id ?? 0),
      title: String(item.title ?? ""),
      category: String(item.category ?? ""),
    }));

    return {
      ...vm,
      phaseState: rows.length ? "populated" : "empty",
      availableCount: rows.length,
      testimonyCount: Math.min(vm.testimonyCount, Math.max(rows.length, 1)),
      rows,
      selectedRow,
      featuredPictureOrder,
      availablePictures,
    };
  } catch {
    return getHomeManagementViewModel({ ...input, state: "error" });
  }
}
