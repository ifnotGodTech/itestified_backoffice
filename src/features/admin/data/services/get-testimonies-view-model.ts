import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  TestimonyCategoryOption,
  TestimoniesViewModel,
  TestimonyRow,
  TestimonyState,
  TestimonyTab,
  TextTestimonyRow,
  VideoTestimonyScreen,
  VideoTestimonyRow,
  VideoTestimonyStatus,
  WrittenTestimonyStatus,
} from "@/features/admin/domain/entities/testimonies";

const tabs: Array<{ key: TestimonyTab; label: string }> = [
  { key: "text", label: "Text" },
  { key: "video", label: "Video" },
];

const videoStatusTabs: Array<{ key: VideoTestimonyStatus; label: string }> = [
  { key: "All", label: "All" },
  { key: "Uploaded", label: "Uploaded" },
  { key: "Scheduled", label: "Scheduled" },
  { key: "Drafts", label: "Drafts" },
  { key: "Archived", label: "Archived" },
];

const fallbackCategories: TestimonyCategoryOption[] = [
  { id: 1, name: "Healing", slug: "healing", description: "", isActive: true },
  { id: 2, name: "Deliverance", slug: "deliverance", description: "", isActive: true },
  { id: 3, name: "Faith", slug: "faith", description: "", isActive: true },
  { id: 4, name: "Salvation", slug: "salvation", description: "", isActive: true },
];

const sampleBody =
  "I want to give all the glory to God for the miraculous healing I received. For the past few months, I had been suffering from severe back pain that made it difficult to even get out of bed in the morning. I tried everything from medication to physical therapy, but nothing seemed to work. One Sunday, after service, I approached the prayer team and asked for prayers for healing. As they laid hands on me and prayed, I felt a warmth spread through my back, and the pain immediately started to decrease. By the time I got home that day, the pain was completely gone. It has now been three weeks, and I haven't felt even a hint of discomfort. I am so thankful to God for this miracle and want to encourage anyone who is struggling to believe in His power to heal. Our God is a healer, and He hears our prayers!";

const textRows: TextTestimonyRow[] = [
  {
    kind: "text",
    id: 1,
    title: "Miraculous Healing After Prayer",
    testimonyId: "TEXT-001",
    name: "Emmanuel Oreoluwa",
    email: "johnstone@gmail.com",
    category: "Healing",
    dateSubmitted: "08/08/2024",
    likes: 0,
    comments: 0,
    shares: 0,
    status: "Pending",
    avatarSrc: "/admin-logo.svg",
    body: sampleBody,
  },
  {
    kind: "text",
    id: 2,
    title: "Restored Faith Through Worship",
    testimonyId: "TEXT-001",
    name: "John Stone",
    email: "johnstone@gmail.com",
    category: "Deliverance",
    dateSubmitted: "08/08/2024",
    likes: 15,
    comments: 15,
    shares: 15,
    status: "Approved",
    avatarSrc: "/admin-logo.svg",
    body: sampleBody,
    approvedBy: "Super Admin Ore on 2024-01-17",
  },
  {
    kind: "text",
    id: 3,
    title: "Breakthrough in Family Prayer",
    testimonyId: "TEXT-003",
    name: "Kelechi Ubani",
    email: "kelechi@gmail.com",
    category: "Healing",
    dateSubmitted: "08/08/2024",
    likes: 15,
    comments: 15,
    shares: 15,
    status: "Approved",
    avatarSrc: "/admin-logo.svg",
    body: sampleBody,
    approvedBy: "Super Admin Ore on 2024-01-17",
  },
  {
    kind: "text",
    id: 4,
    title: "Healing Journey in Progress",
    testimonyId: "TEXT-004",
    name: "Kelechi Ubani",
    email: "kelechi@gmail.com",
    category: "Healing",
    dateSubmitted: "08/08/2024",
    likes: 0,
    comments: 0,
    shares: 0,
    status: "Rejected",
    avatarSrc: "/admin-logo.svg",
    body: sampleBody,
  },
];

const videoRows: VideoTestimonyRow[] = [
  {
    kind: "video",
    id: 1,
    title: "God Healed Me",
    category: "Healing",
    source: "You-tube",
    dateUploaded: "08/08/2024",
    uploadedBy: "Super Admin",
    views: 20,
    likes: 15,
    comments: 15,
    shares: 15,
    status: "Uploaded",
    thumbnailSrc: "/admin-logo.svg",
  },
  {
    kind: "video",
    id: 2,
    title: "God Healed Me",
    category: "Deliverance",
    source: "You-tube",
    dateUploaded: "08/08/2024",
    uploadedBy: "N/A",
    views: null,
    likes: null,
    comments: null,
    shares: null,
    status: "Scheduled",
    thumbnailSrc: "/admin-logo.svg",
  },
  {
    kind: "video",
    id: 3,
    title: "God Healed Me",
    category: "Healing",
    source: "You-tube",
    dateUploaded: "08/08/2024",
    uploadedBy: "N/A",
    views: null,
    likes: null,
    comments: null,
    shares: null,
    status: "Drafts",
    thumbnailSrc: "/admin-logo.svg",
  },
];

function normalizeTab(tab?: string): TestimonyTab {
  if (tab === "video") return tab;
  return "text";
}

function normalizeState(state?: string): TestimonyState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function normalizeStatusFilter(status?: string): WrittenTestimonyStatus | undefined {
  if (
    status === "Pending" ||
    status === "Approved" ||
    status === "Rejected" ||
    status === "Scheduled" ||
    status === "Archived"
  ) {
    return status;
  }
  return undefined;
}

function normalizeVideoStatus(status?: string): VideoTestimonyStatus {
  if (status === "Uploaded" || status === "Scheduled" || status === "Drafts" || status === "Archived") return status;
  return "All";
}

function normalizeVideoScreen(screen?: string): VideoTestimonyScreen {
  if (screen === "upload" || screen === "activity") return screen;
  return "list";
}

function rowsForTab(tab: TestimonyTab) {
  return tab === "video" ? videoRows : textRows;
}

function matchesSearch(row: TestimonyRow, query: string) {
  const haystack =
    row.kind === "video"
      ? `${row.title} ${row.category} ${row.source} ${row.uploadedBy}`
      : `${row.name} ${row.category} ${row.testimonyId}`;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function categoryMatches(rowCategory: string, selectedCategory: string): boolean {
  if (!selectedCategory) return true;
  const normalizedRow = rowCategory.trim().toLowerCase();
  const normalizedSelected = selectedCategory.trim().toLowerCase();
  if (normalizedRow === normalizedSelected) return true;
  const slugifiedRow = normalizedRow.replace(/\s+/g, "-");
  return slugifiedRow === normalizedSelected;
}

export function getTestimoniesViewModel(input: {
  tab?: string;
  videoStatus?: string;
  screen?: string;
  state?: string;
  q?: string;
  from?: string;
  to?: string;
  category?: string;
  source?: string;
  categoryMenuOpen?: string;
  sourceMenuOpen?: string;
  menu?: string;
  view?: string;
  reject?: string;
  schedule?: string;
  edit?: string;
  archive?: string;
  remove?: string;
  filter?: string;
  settings?: string;
  statusFilter?: string;
  success?: string;
  origin?: string;
  fullName?: string;
}): TestimoniesViewModel {
  const activeTab = normalizeTab(input.tab);
  const activeVideoStatus = normalizeVideoStatus(input.videoStatus);
  const activeVideoScreen = normalizeVideoScreen(input.screen);
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";
  const statusFilter = normalizeStatusFilter(input.statusFilter);
  const baseRows = rowsForTab(activeTab);
  const dateFrom = input.from?.trim() ?? "";
  const dateTo = input.to?.trim() ?? "";
  const category = input.category?.trim() ?? "";
  const source = input.source?.trim() ?? "";
  const searchedRows = searchQuery ? baseRows.filter((row) => matchesSearch(row, searchQuery)) : baseRows;
  const filteredRows =
    activeTab === "video"
      ? searchedRows.filter((row) => {
          if (row.kind !== "video") return false;
          const matchesStatus = activeVideoStatus === "All" ? true : row.status === activeVideoStatus;
          const matchesCategory = categoryMatches(row.category, category);
          const matchesSource = source ? row.source === source : true;
          const matchesFrom = dateFrom ? row.dateUploaded === dateFrom : true;
          const matchesTo = dateTo ? row.dateUploaded === dateTo : true;
          return matchesStatus && matchesCategory && matchesSource && matchesFrom && matchesTo;
        })
      : searchedRows.filter((row) => {
          if (row.kind !== "text") return false;
          const matchesStatus = statusFilter ? row.status === statusFilter : true;
          const matchesCategory = categoryMatches(row.category, category);
          const matchesFrom = dateFrom ? row.dateSubmitted === dateFrom : true;
          const matchesTo = dateTo ? row.dateSubmitted === dateTo : true;
          return matchesStatus && matchesCategory && matchesFrom && matchesTo;
        });
  const rows = phaseState === "populated" ? filteredRows : [];
  const selectedId = Number(input.menu ?? input.view ?? input.reject ?? input.schedule ?? input.archive ?? input.edit ?? input.remove ?? "");
  const selectedRow = Number.isFinite(selectedId) ? baseRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage =
    input.success === "approve"
      ? "Testimony Approved Successfully!"
      : input.success === "upload"
        ? "Video Uploaded Successfully!"
        : undefined;
  const origin = input.origin === "notification" ? "notification" : "list";
  const detailReturnHref = origin === "notification" ? "/notifications-history" : undefined;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/testimonies",
      activeChildHref:
        activeTab === "video" && activeVideoScreen === "upload"
          ? "/testimonies?tab=video&screen=upload"
          : activeTab === "video"
            ? "/testimonies?tab=video"
            : "/testimonies",
      fullName: input.fullName,
    }),
    activeTab,
    activeVideoStatus,
    activeVideoScreen,
    phaseState,
    searchQuery,
    tabs,
    videoStatusTabs,
    categories: fallbackCategories,
    rows,
    selectedRow,
    totalRows: rows.length,
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    errorMessage: phaseState === "error" ? "We could not load testimonies right now. Please try again." : undefined,
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.view),
    showRejectModal: Boolean(input.reject),
    showScheduleModal: Boolean(input.schedule),
    showArchiveModal: Boolean(input.archive),
    showEditModal: Boolean(input.edit),
    showDeleteModal: Boolean(input.remove),
    showFilterModal: input.filter === "1",
    showSettingsModal: input.settings === "1",
    showSuccess: Boolean(successMessage),
    successMessage,
    filterDraft: {
      from: dateFrom,
      to: dateTo,
      category,
      source,
      status: statusFilter,
      categoryMenuOpen: input.categoryMenuOpen === "1",
      sourceMenuOpen: input.sourceMenuOpen === "1",
    },
    origin,
    detailReturnHref,
  };
}

type BackendTestimony = {
  id: number;
  title: string;
  testimony_type: "written" | "video";
  status: "pending_review" | "approved" | "rejected" | "scheduled" | "archived";
  author_name: string;
  author_email: string;
  category: string;
  category_slug?: string;
  view_count: number;
  comment_count: number;
  created_at: string;
  publish_at?: string | null;
  archived_at?: string | null;
  moderation_history?: Array<{
    id: number;
    action: "approved" | "rejected" | "scheduled" | "archived" | "auto_published";
    from_status: string;
    to_status: string;
    reason: string;
    publish_at?: string | null;
    created_at: string;
    actor_email?: string | null;
    actor_name?: string | null;
  }>;
  body?: string;
  thumbnail_url?: string;
};

type BackendCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
};

function mapBackendStatusToText(status: BackendTestimony["status"]): WrittenTestimonyStatus {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "scheduled") return "Scheduled";
  if (status === "archived") return "Archived";
  return "Pending";
}

function mapBackendStatusToVideo(status: BackendTestimony["status"]): Exclude<VideoTestimonyStatus, "All"> {
  if (status === "approved") return "Uploaded";
  if (status === "rejected") return "Drafts";
  if (status === "scheduled") return "Scheduled";
  if (status === "archived") return "Archived";
  return "Drafts";
}

export async function getTestimoniesViewModelFromBackend(
  input: Parameters<typeof getTestimoniesViewModel>[0] & { cookieHeader?: string },
): Promise<TestimoniesViewModel> {
  const base = getTestimoniesViewModel(input);
  const activeTab = input.tab === "video" ? "video" : "text";
  const statusFilter =
    activeTab === "text"
      ? input.statusFilter === "Approved"
        ? "approved"
        : input.statusFilter === "Rejected"
          ? "rejected"
          : input.statusFilter === "Pending"
            ? "pending_review"
            : input.statusFilter === "Scheduled"
              ? "scheduled"
              : input.statusFilter === "Archived"
                ? "archived"
            : ""
      : input.videoStatus === "Uploaded"
        ? "approved"
      : input.videoStatus === "Drafts"
          ? "rejected"
        : input.videoStatus === "Scheduled"
            ? "scheduled"
          : input.videoStatus === "Archived"
            ? "archived"
            : "";
  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  if (input.q?.trim()) params.set("search", input.q.trim());
  if (input.category?.trim()) params.set("category", input.category.trim());
  params.set("page_size", "100");

  try {
    const [testimoniesResponse, categoriesResponse] = await Promise.all([
      fetch(`${backendBaseUrl}/testimonies/admin/testimonies/?${params.toString()}`, {
        headers: input.cookieHeader ? { cookie: input.cookieHeader } : {},
        cache: "no-store",
      }),
      fetch(`${backendBaseUrl}/testimonies/admin/categories/`, {
        headers: input.cookieHeader ? { cookie: input.cookieHeader } : {},
        cache: "no-store",
      }),
    ]);
    if (!testimoniesResponse.ok || !categoriesResponse.ok) {
      return {
        ...base,
        phaseState: "error",
        rows: [],
        totalRows: 0,
        showingLabel: "Showing 0 of 0",
      };
    }
    const testimoniesPayload = (await testimoniesResponse.json()) as { results?: BackendTestimony[] };
    const categoriesPayload = (await categoriesResponse.json()) as BackendCategory[];
    const backendRows = testimoniesPayload.results ?? [];
    const categories: TestimonyCategoryOption[] = (categoriesPayload ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      isActive: category.is_active,
    }));
    const typedRows: TestimonyRow[] = backendRows
      .filter((item) => (activeTab === "video" ? item.testimony_type === "video" : item.testimony_type === "written"))
      .map((item) => {
        if (item.testimony_type === "video") {
          return {
            kind: "video",
            id: item.id,
            title: item.title,
            category: item.category,
            source: "Mobile upload",
            dateUploaded: new Date(item.created_at).toLocaleDateString("en-GB"),
            uploadedBy: item.author_name,
            views: item.view_count,
            likes: null,
            comments: item.comment_count,
            shares: null,
            status: mapBackendStatusToVideo(item.status),
            thumbnailSrc: item.thumbnail_url || "/admin-logo.svg",
          } satisfies VideoTestimonyRow;
        }
        return {
          kind: "text",
          id: item.id,
          title: item.title,
          testimonyId: `TEXT-${String(item.id).padStart(3, "0")}`,
          name: item.author_name,
          email: item.author_email,
          category: item.category,
          dateSubmitted: new Date(item.created_at).toLocaleDateString("en-GB"),
          likes: 0,
          comments: item.comment_count,
          shares: 0,
          status: mapBackendStatusToText(item.status),
          avatarSrc: "/admin-logo.svg",
          body: item.body || "",
        } satisfies TextTestimonyRow;
      });

    const selectedId = Number(input.menu ?? input.view ?? input.reject ?? input.schedule ?? input.archive ?? input.edit ?? input.remove ?? "");
    let selectedRow = Number.isFinite(selectedId) ? typedRows.find((row) => row.id === selectedId) ?? null : null;
    if (selectedRow && input.view) {
      const detailResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/${selectedRow.id}/`, {
        headers: input.cookieHeader ? { cookie: input.cookieHeader } : {},
        cache: "no-store",
      });
      if (detailResponse.ok) {
        const detailPayload = (await detailResponse.json()) as BackendTestimony;
        const moderationHistory = detailPayload.moderation_history ?? [];
        selectedRow =
          selectedRow.kind === "text"
            ? {
                ...selectedRow,
                body: detailPayload.body || selectedRow.body,
                moderationHistory,
              }
            : { ...selectedRow, moderationHistory };
      }
    }
    return {
      ...base,
      phaseState: "populated",
      categories: categories.length > 0 ? categories : fallbackCategories,
      rows: typedRows,
      selectedRow,
      totalRows: typedRows.length,
      showingLabel: typedRows.length === 0 ? "Showing 0 of 0" : `Showing 1-${typedRows.length} of ${typedRows.length}`,
    };
  } catch {
    return {
      ...base,
      phaseState: "error",
      rows: [],
      totalRows: 0,
      showingLabel: "Showing 0 of 0",
    };
  }
}
