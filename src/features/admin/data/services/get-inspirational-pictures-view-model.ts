import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  InspirationalPictureRow,
  InspirationalPictureScreen,
  InspirationalPictureState,
  InspirationalPictureStatus,
  InspirationalPicturesViewModel,
} from "@/features/admin/domain/entities/inspirational-pictures";

const statusTabs: Array<{ key: InspirationalPictureStatus; label: string }> = [
  { key: "All", label: "All" },
  { key: "Uploaded", label: "Uploaded" },
  { key: "Scheduled", label: "Scheduled" },
  { key: "Drafts", label: "Drafts" },
];

const pictureRows: InspirationalPictureRow[] = [
  {
    id: 1,
    title: "God's Grace",
    status: "Uploaded",
    category: "Faith",
    uploadedBy: "Elvis/Super Admin",
    dateLabel: "08/08/24",
    source: "Instagram.com",
    downloadCount: 0,
    shareCount: 0,
    imageSrc: "/admin-logo.svg",
  },
  {
    id: 2,
    title: "Morning Mercy",
    status: "Scheduled",
    category: "Hope",
    uploadedBy: "Content Manager",
    dateLabel: "08/08/24",
    source: "Instagram.com",
    scheduledTime: "03:00PM",
    downloadCount: 0,
    shareCount: 0,
    imageSrc: "/admin-logo.svg",
  },
  {
    id: 3,
    title: "Spirit Led",
    status: "Drafts",
    category: "Prayer",
    uploadedBy: "Elvis/Super Admin",
    dateLabel: "08/08/24",
    source: "Instagram.com",
    downloadCount: 0,
    shareCount: 0,
    imageSrc: "/admin-logo.svg",
  },
];

function normalizeStatus(status?: string): InspirationalPictureStatus {
  if (status === "Uploaded" || status === "Scheduled" || status === "Drafts") return status;
  return "All";
}

function normalizeScreen(screen?: string): InspirationalPictureScreen {
  if (screen === "upload") return screen;
  return "list";
}

function normalizeState(state?: string): InspirationalPictureState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function matchesSearch(row: InspirationalPictureRow, query: string) {
  return `${row.title} ${row.category} ${row.uploadedBy} ${row.source}`.toLowerCase().includes(query.toLowerCase());
}

export function getInspirationalPicturesViewModel(input: {
  status?: string;
  screen?: string;
  state?: string;
  q?: string;
  menu?: string;
  view?: string;
  edit?: string;
  remove?: string;
  success?: string;
  fullName?: string;
}): InspirationalPicturesViewModel {
  const activeStatus = normalizeStatus(input.status);
  const activeScreen = normalizeScreen(input.screen);
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";
  const searchedRows = searchQuery ? pictureRows.filter((row) => matchesSearch(row, searchQuery)) : pictureRows;
  const filteredRows = searchedRows.filter((row) => (activeStatus === "All" ? true : row.status === activeStatus));
  const rows = phaseState === "populated" ? filteredRows : [];
  const selectedId = Number(input.menu ?? input.view ?? input.edit ?? input.remove ?? "");
  const selectedRow = Number.isFinite(selectedId) ? pictureRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage = input.success === "upload" ? "Uploaded Successfully!" : undefined;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/inspirational-pictures",
      activeChildHref: activeScreen === "upload" ? "/inspirational-pictures?screen=upload" : "/inspirational-pictures",
      fullName: input.fullName,
    }),
    activeStatus,
    activeScreen,
    phaseState,
    searchQuery,
    statusTabs,
    rows,
    selectedRow,
    totalRows: rows.length,
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    errorMessage: phaseState === "error" ? "We could not load inspirational pictures right now. Please try again." : undefined,
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.view),
    showEditModal: Boolean(input.edit),
    showDeleteModal: Boolean(input.remove),
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}
