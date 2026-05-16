import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
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
];

const sampleBody =
  "I want to give all the glory to God for the miraculous healing I received. For the past few months, I had been suffering from severe back pain that made it difficult to even get out of bed in the morning. I tried everything from medication to physical therapy, but nothing seemed to work. One Sunday, after service, I approached the prayer team and asked for prayers for healing. As they laid hands on me and prayed, I felt a warmth spread through my back, and the pain immediately started to decrease. By the time I got home that day, the pain was completely gone. It has now been three weeks, and I haven't felt even a hint of discomfort. I am so thankful to God for this miracle and want to encourage anyone who is struggling to believe in His power to heal. Our God is a healer, and He hears our prayers!";

const textRows: TextTestimonyRow[] = [
  {
    kind: "text",
    id: 1,
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
  if (status === "Pending" || status === "Approved" || status === "Rejected") return status;
  return undefined;
}

function normalizeVideoStatus(status?: string): VideoTestimonyStatus {
  if (status === "Uploaded" || status === "Scheduled" || status === "Drafts") return status;
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
  edit?: string;
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
          const matchesCategory = category ? row.category === category : true;
          const matchesSource = source ? row.source === source : true;
          const matchesFrom = dateFrom ? row.dateUploaded === dateFrom : true;
          const matchesTo = dateTo ? row.dateUploaded === dateTo : true;
          return matchesStatus && matchesCategory && matchesSource && matchesFrom && matchesTo;
        })
      : searchedRows.filter((row) => {
          if (row.kind !== "text") return false;
          const matchesStatus = statusFilter ? row.status === statusFilter : true;
          const matchesCategory = category ? row.category === category : true;
          const matchesFrom = dateFrom ? row.dateSubmitted === dateFrom : true;
          const matchesTo = dateTo ? row.dateSubmitted === dateTo : true;
          return matchesStatus && matchesCategory && matchesFrom && matchesTo;
        });
  const rows = phaseState === "populated" ? filteredRows : [];
  const selectedId = Number(input.menu ?? input.view ?? input.reject ?? input.edit ?? input.remove ?? "");
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
    rows,
    selectedRow,
    totalRows: rows.length,
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    errorMessage: phaseState === "error" ? "We could not load testimonies right now. Please try again." : undefined,
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.view),
    showRejectModal: Boolean(input.reject),
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
