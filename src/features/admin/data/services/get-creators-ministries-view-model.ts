import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import { formatShowingLabel, paginateRows, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  CreatorMinistryRow,
  CreatorMinistryTab,
  CreatorsMinistriesState,
  CreatorsMinistriesViewModel,
} from "@/features/admin/domain/entities/creators-ministries";

const tabs: Array<{ key: CreatorMinistryTab; label: string }> = [
  { key: "queue", label: "Verification Requests" },
  { key: "all", label: "All Ministries" },
  { key: "verified", label: "Verified" },
  { key: "unverified", label: "Unverified" },
];

const creatorRows: CreatorMinistryRow[] = [
  {
    id: 1,
    userId: 101,
    displayName: "Grace Restoration Ministries",
    email: "grace.restoration@example.com",
    bio: "Sharing testimonies of healing and restoration from our weekly services in Lagos.",
    avatarUrl: "",
    isVerified: false,
    verifiedAt: null,
    verificationRequestedAt: "2026-08-15T09:00:00Z",
    verifiedByEmail: null,
    followerCount: 412,
    createdAt: "2026-05-01T09:00:00Z",
  },
  {
    id: 2,
    userId: 102,
    displayName: "New Life Fellowship",
    email: "office@newlifefellowship.org",
    bio: "A house of prayer for all nations.",
    avatarUrl: "",
    isVerified: true,
    verifiedAt: "2026-07-01T09:00:00Z",
    verificationRequestedAt: "2026-06-20T09:00:00Z",
    verifiedByEmail: "admin@itestified.app",
    followerCount: 5204,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: 3,
    userId: 103,
    displayName: "Shiloh Chapel",
    email: "shilohchapel.ph@example.com",
    bio: "",
    avatarUrl: "",
    isVerified: false,
    verifiedAt: null,
    verificationRequestedAt: null,
    verifiedByEmail: null,
    followerCount: 19,
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: 4,
    userId: 104,
    displayName: "Rivers of Mercy",
    email: "riversofmercy.ng@example.com",
    bio: "Encouraging testimonies from our youth revival services.",
    avatarUrl: "",
    isVerified: false,
    verifiedAt: null,
    verificationRequestedAt: "2026-08-19T09:00:00Z",
    verifiedByEmail: null,
    followerCount: 67,
    createdAt: "2026-06-15T09:00:00Z",
  },
];

function normalizeTab(tab?: string): CreatorMinistryTab {
  if (tab === "all" || tab === "verified" || tab === "unverified") return tab;
  return "queue";
}

function normalizeState(state?: string): CreatorsMinistriesState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function filterRowsByTab(rows: CreatorMinistryRow[], activeTab: CreatorMinistryTab) {
  if (activeTab === "all") return rows;
  if (activeTab === "verified") return rows.filter((row) => row.isVerified);
  if (activeTab === "unverified") return rows.filter((row) => !row.isVerified);
  return rows.filter((row) => !row.isVerified && row.verificationRequestedAt !== null);
}

function getTableTitle(activeTab: CreatorMinistryTab) {
  if (activeTab === "queue") return "Verification Requests";
  if (activeTab === "verified") return "Verified Ministries";
  if (activeTab === "unverified") return "Unverified Ministries";
  return "All Ministries";
}

function getSuccessMessage(kind?: string) {
  if (kind === "verify") return "Ministry verified successfully!";
  if (kind === "unverify") return "Verification removed.";
  return undefined;
}

export function getCreatorsMinistriesViewModel(input: {
  tab?: string;
  state?: string;
  q?: string;
  menu?: string;
  detail?: string;
  verify?: string;
  unverify?: string;
  success?: string;
  fullName?: string;
  page?: string;
}): CreatorsMinistriesViewModel {
  const activeTab = normalizeTab(input.tab);
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";

  const tabRows = filterRowsByTab(creatorRows, activeTab);
  const searchedRows = searchQuery
    ? tabRows.filter((row) => `${row.displayName} ${row.email}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabRows;
  const allRows = phaseState === "populated" ? searchedRows : [];
  const page = parsePageParam(input.page);
  const { pageRows: rows, hasNextPage, hasPreviousPage } = paginateRows(allRows, page);

  const selectedId = Number(input.menu ?? input.detail ?? input.verify ?? input.unverify ?? "");
  const selectedRow = Number.isFinite(selectedId) ? creatorRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage = getSuccessMessage(input.success);

  return {
    shell: getAdminShellViewModel({ activeHref: "/creators-ministries", fullName: input.fullName }),
    activeTab,
    phaseState,
    pageTitle: "Creators & Ministries",
    pageDescription:
      "Review Ministry identity — verification is a trust badge only. It never changes what a Ministry can already do.",
    searchQuery,
    tabs,
    rows,
    selectedRow,
    showingLabel: formatShowingLabel(page, rows.length, allRows.length),
    page,
    hasNextPage,
    hasPreviousPage,
    errorMessage: phaseState === "error" ? "We could not load Ministry profiles right now. Please try again." : undefined,
    searchPlaceholder: "Search by name or email…",
    topStats:
      phaseState === "error"
        ? [{ label: "Ministries (—)", value: "", tone: "info" }]
        : [{ label: `Ministries (${creatorRows.length})`, value: "", tone: "info" }],
    tableTitle: getTableTitle(activeTab),
    tableBadge: phaseState === "error" ? { totalLabel: "Total (—)" } : { totalLabel: `Total (${rows.length})` },
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.detail),
    showVerifyConfirm: Boolean(input.verify),
    showUnverifyConfirm: Boolean(input.unverify),
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}

export function toDateLabel(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapRows(results: Array<Record<string, unknown>>): CreatorMinistryRow[] {
  return results.map((item) => ({
    id: Number(item.id ?? 0),
    userId: Number(item.user_id ?? 0),
    displayName: String(item.display_name ?? ""),
    email: String(item.user_email ?? ""),
    bio: String(item.bio ?? ""),
    avatarUrl: String(item.avatar_url ?? ""),
    isVerified: Boolean(item.is_verified),
    verifiedAt: (item.verified_at as string | null) ?? null,
    verificationRequestedAt: (item.verification_requested_at as string | null) ?? null,
    verifiedByEmail: (item.verified_by_email as string | null) ?? null,
    followerCount: Number(item.follower_count ?? 0),
    createdAt: String(item.created_at ?? ""),
  }));
}

export async function getCreatorsMinistriesViewModelFromApi(
  input: {
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    detail?: string;
    verify?: string;
    unverify?: string;
    success?: string;
    fullName?: string;
    page?: string;
  },
  cookieHeader: string,
): Promise<CreatorsMinistriesViewModel> {
  const page = parsePageParam(input.page);
  try {
    const activeTab = normalizeTab(input.tab);
    const searchParams = new URLSearchParams();
    if (activeTab === "verified") searchParams.set("is_verified", "true");
    if (activeTab === "unverified") searchParams.set("is_verified", "false");
    if (activeTab === "queue") {
      searchParams.set("is_verified", "false");
      searchParams.set("verification_requested", "true");
    }
    if (input.q?.trim()) searchParams.set("search", input.q.trim());
    searchParams.set("page", String(page));
    const query = searchParams.toString();
    const url = `${backendBaseUrl}/creators/admin/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...getCreatorsMinistriesViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
    };
    const rawResults = payload.results ?? [];
    const rows = mapRows(rawResults);
    const vm = getCreatorsMinistriesViewModel(input);
    const total = payload.count ?? rows.length;

    return {
      ...vm,
      phaseState: rows.length === 0 ? "empty" : "populated",
      rows,
      selectedRow: (() => {
        const selectedId = Number(input.menu ?? input.detail ?? input.verify ?? input.unverify ?? "");
        return Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;
      })(),
      showingLabel: formatShowingLabel(page, rows.length, total),
      page,
      hasNextPage: Boolean(payload.next),
      hasPreviousPage: Boolean(payload.previous) || page > 1,
      topStats: [{ label: `Ministries (${total})`, value: "", tone: "info" as const }],
      tableBadge: { totalLabel: `Total (${rows.length})` },
    };
  } catch {
    return { ...getCreatorsMinistriesViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
  }
}
