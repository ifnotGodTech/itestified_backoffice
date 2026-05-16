import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  ScriptureDraft,
  ScriptureFilterDraft,
  ScriptureOfTheDayViewModel,
  ScriptureRow,
  ScriptureTab,
} from "@/features/admin/domain/entities/scripture-of-the-day";

const DEFAULT_DRAFT: ScriptureDraft = {
  scripture:
    'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future',
  prayer: "God give me wisdom lord",
  bibleText: "Jeremiah 29:11",
  bibleVersion: "KJV",
};

const SCRIPTURE_ROWS: ScriptureRow[] = [
  {
    id: 1,
    date: "8th Aug 2024",
    bibleText: "Jeremiah 29:11",
    scripture: "The plans i have for you...",
    prayer: "Give me wisdom lord",
    bibleVersion: "KJV",
    status: "Uploaded",
  },
  {
    id: 2,
    date: "8th Aug 2024",
    bibleText: "Jeremiah 29:11",
    scripture: "The plans i have for you...",
    prayer: "Give me wisdom lord",
    bibleVersion: "NIV",
    status: "Scheduled",
    scheduledDate: "11/03/2025",
    scheduledTime: "11/03/2025",
  },
  {
    id: 3,
    date: "8th Aug 2024",
    bibleText: "Jeremiah 29:11",
    scripture: "The plans i have for you...",
    prayer: "Give me wisdom lord",
    bibleVersion: "KJV",
    status: "Scheduled",
    scheduledDate: "11/03/2025",
    scheduledTime: "11/03/2025",
  },
];

function normalizeTab(tab?: string): ScriptureTab {
  if (tab === "uploaded" || tab === "scheduled") return tab;
  return "all";
}

function buildScriptureHref(params: {
  tab?: ScriptureTab;
  q?: string;
  filter?: boolean;
  count?: number | null;
  from?: string;
  to?: string;
  statusFilter?: "" | "Uploaded" | "Scheduled";
  menu?: number | null;
  view?: number | null;
  edit?: string | null;
  remove?: number | null;
  saved?: boolean;
  deleted?: boolean;
  scripture?: string;
  prayer?: string;
  bibleText?: string;
  bibleVersion?: string;
}) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "all") search.set("tab", params.tab);
  if (params.q) search.set("q", params.q);
  if (params.filter) search.set("filter", "1");
  if (params.count) search.set("count", String(params.count));
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.statusFilter) search.set("status", params.statusFilter);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.view) search.set("view", String(params.view));
  if (params.edit) search.set("edit", params.edit);
  if (params.remove) search.set("remove", String(params.remove));
  if (params.saved) search.set("saved", "1");
  if (params.deleted) search.set("deleted", "1");
  if (params.scripture) search.set("scripture", params.scripture);
  if (params.prayer) search.set("prayer", params.prayer);
  if (params.bibleText) search.set("bibleText", params.bibleText);
  if (params.bibleVersion) search.set("bibleVersion", params.bibleVersion);
  const query = search.toString();
  return query ? `/scripture-of-the-day?${query}` : "/scripture-of-the-day";
}

function getBaseDraft(input: {
  row: ScriptureRow | null;
  scripture?: string;
  prayer?: string;
  bibleText?: string;
  bibleVersion?: string;
}): ScriptureDraft {
  return {
    scripture: input.scripture ?? input.row?.scripture ?? DEFAULT_DRAFT.scripture,
    prayer: input.prayer ?? input.row?.prayer ?? DEFAULT_DRAFT.prayer,
    bibleText: input.bibleText ?? input.row?.bibleText ?? DEFAULT_DRAFT.bibleText,
    bibleVersion: input.bibleVersion ?? input.row?.bibleVersion ?? DEFAULT_DRAFT.bibleVersion,
  };
}

export function getScriptureOfTheDayViewModel(input: {
  fullName?: string;
  tab?: string;
  q?: string;
  filter?: string;
  count?: string;
  from?: string;
  to?: string;
  status?: string;
  menu?: string;
  view?: string;
  edit?: string;
  remove?: string;
  saved?: string;
  deleted?: string;
  scripture?: string;
  prayer?: string;
  bibleText?: string;
  bibleVersion?: string;
}): ScriptureOfTheDayViewModel {
  const activeTab = normalizeTab(input.tab);
  const searchQuery = input.q?.trim() ?? "";
  const scheduleEntryCount = Math.min(Math.max(Number(input.count ?? "1") || 1, 1), 20);
  const filterDraft: ScriptureFilterDraft = {
    from: input.from ?? "",
    to: input.to ?? "",
    status: input.status === "Uploaded" || input.status === "Scheduled" ? input.status : "",
  };

  const tabFilteredRows =
    activeTab === "all"
      ? SCRIPTURE_ROWS
      : SCRIPTURE_ROWS.filter((row) => row.status.toLowerCase() === activeTab);

  const filteredRows = filterDraft.status ? tabFilteredRows.filter((row) => row.status === filterDraft.status) : tabFilteredRows;

  const searchedRows = searchQuery
    ? filteredRows.filter((row) =>
        `${row.bibleVersion} ${row.scripture} ${row.prayer} ${row.bibleText}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredRows;

  const selectedId = Number(input.menu ?? input.view ?? input.edit ?? input.remove ?? "");
  const selectedRow = Number.isFinite(selectedId) ? SCRIPTURE_ROWS.find((row) => row.id === selectedId) ?? null : null;
  const editDraft = getBaseDraft({
    row: selectedRow,
    scripture: input.scripture,
    prayer: input.prayer,
    bibleText: input.bibleText,
    bibleVersion: input.bibleVersion,
  });

  return {
    shell: getAdminShellViewModel({
      activeHref: "/scripture-of-the-day",
      activeChildHref: input.edit === "new" ? "/scripture-of-the-day?edit=new" : "/scripture-of-the-day",
      fullName: input.fullName,
    }),
    activeTab,
    tabs: [
      { key: "all", label: "All" },
      { key: "uploaded", label: "Uploaded" },
      { key: "scheduled", label: "Scheduled" },
    ],
    searchQuery,
    rows: searchedRows,
    totalRows: searchedRows.length,
    showingLabel: searchedRows.length === 0 ? "Showing 0 of 0" : `Showing 1-${searchedRows.length} of ${searchedRows.length}`,
    selectedRow,
    editDraft,
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.view),
    showEdit: Boolean(input.edit),
    showDeleteConfirm: Boolean(input.remove),
    showFilterModal: input.filter === "1",
    showScheduleBuilder: input.edit === "new",
    isCreatingNew: input.edit === "new",
    saved: input.saved === "1",
    deleteSuccess: input.deleted === "1",
    scheduleEntryCount,
    filterDraft,
    actionItems: [
      {
        label: "Upload New Scripture",
        href: buildScriptureHref({
          tab: activeTab,
          q: searchQuery,
          edit: "new",
          count: scheduleEntryCount,
          scripture: DEFAULT_DRAFT.scripture,
          prayer: DEFAULT_DRAFT.prayer,
          bibleText: DEFAULT_DRAFT.bibleText,
          bibleVersion: DEFAULT_DRAFT.bibleVersion,
        }),
        active: false,
      },
    ],
  };
}

function mapScriptureRows(results: Array<Record<string, unknown>>): ScriptureRow[] {
  return results.map((item) => {
    const date = String(item.date ?? "");
    const status = String(item.status ?? "") === "published" ? "Uploaded" : "Scheduled";
    return {
      id: Number(item.id ?? 0),
      date,
      bibleText: String(item.bible_text ?? ""),
      scripture: String(item.scripture ?? ""),
      prayer: String(item.prayer ?? ""),
      bibleVersion: String(item.bible_version ?? ""),
      status,
      scheduledDate: status === "Scheduled" ? date : undefined,
      scheduledTime: status === "Scheduled" ? "00:00" : undefined,
    };
  });
}

export async function getScriptureOfTheDayViewModelFromApi(
  input: {
    fullName?: string;
    tab?: string;
    q?: string;
    filter?: string;
    count?: string;
    from?: string;
    to?: string;
    status?: string;
    menu?: string;
    view?: string;
    edit?: string;
    remove?: string;
    saved?: string;
    deleted?: string;
    scripture?: string;
    prayer?: string;
    bibleText?: string;
    bibleVersion?: string;
  },
  cookieHeader: string,
): Promise<ScriptureOfTheDayViewModel> {
  try {
    const tab = input.tab;
    const params = new URLSearchParams();
    if (tab === "uploaded") params.set("status", "published");
    if (tab === "scheduled") params.set("status", "scheduled");
    if (input.q?.trim()) params.set("q", input.q.trim());
    const query = params.toString();
    const url = `${backendBaseUrl}/content/admin/scriptures/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return getScriptureOfTheDayViewModel({ ...input, tab, q: input.q });
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
    };
    const rows = mapScriptureRows(payload.results ?? []);
    const vm = getScriptureOfTheDayViewModel(input);
    const selectedId = Number(input.menu ?? input.view ?? input.edit ?? input.remove ?? "");
    return {
      ...vm,
      rows,
      totalRows: payload.count ?? rows.length,
      showingLabel:
        rows.length === 0
          ? "Showing 0 of 0"
          : `Showing 1-${rows.length} of ${payload.count ?? rows.length}`,
      selectedRow: Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null,
    };
  } catch {
    return getScriptureOfTheDayViewModel(input);
  }
}
