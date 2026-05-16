import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  HomeManagementDisplayRule,
  HomeManagementPhaseState,
  HomeManagementRow,
  HomeManagementTab,
  HomeManagementViewModel,
} from "@/features/admin/domain/entities/home-management";

const DISPLAY_RULE_OPTIONS: HomeManagementDisplayRule[] = ["Trending", "Most Recent", "Most Shared"];

const baseRows: HomeManagementRow[] = [
  {
    id: 1,
    kind: "video",
    title: "God healed...",
    category: "Healing",
    source: "You-tube",
    dateUploaded: "08/08/2024",
    uploadedBy: "Super Admin",
    views: 92,
    likes: 44,
    comments: 12,
    shares: 32,
    thumbnailLabel: "God Healed Me",
    thumbnailSrc: "/admin-logo.svg",
    status: "Uploaded",
  },
  {
    id: 2,
    kind: "video",
    title: "God healed...",
    category: "Deliverance",
    source: "You-tube",
    dateUploaded: "09/08/2024",
    uploadedBy: "Super Admin",
    views: 40,
    likes: 16,
    comments: 4,
    shares: 9,
    thumbnailLabel: "God Healed Me",
    thumbnailSrc: "/admin-logo.svg",
    status: "Uploaded",
  },
  {
    id: 3,
    kind: "video",
    title: "God healed...",
    category: "Healing",
    source: "You-tube",
    dateUploaded: "10/08/2024",
    uploadedBy: "Super Admin",
    views: 18,
    likes: 7,
    comments: 2,
    shares: 4,
    thumbnailLabel: "God Healed Me",
    thumbnailSrc: "/admin-icon.svg",
    status: "Uploaded",
  },
  {
    id: 4,
    kind: "video",
    title: "God healed...",
    category: "Healing",
    source: "You-tube",
    dateUploaded: "11/08/2024",
    uploadedBy: "Super Admin",
    views: 71,
    likes: 24,
    comments: 6,
    shares: 18,
    thumbnailLabel: "God Healed Me",
    thumbnailSrc: "/admin-icon.svg",
    status: "Uploaded",
  },
  {
    id: 5,
    kind: "video",
    title: "God healed...",
    category: "Healing",
    source: "You-tube",
    dateUploaded: "12/08/2024",
    uploadedBy: "Super Admin",
    views: 27,
    likes: 10,
    comments: 3,
    shares: 41,
    thumbnailLabel: "God Healed Me",
    thumbnailSrc: "/admin-icon.svg",
    status: "Uploaded",
  },
];

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

const textRows: HomeManagementRow[] = [
  {
    id: 1,
    kind: "text",
    title: "Miraculous Healing After Prayer",
    category: "Healing",
    source: "App submission",
    dateUploaded: "08/08/2024",
    uploadedBy: "Super Admin",
    submitterName: "John Stone",
    submitterEmail: "Johnstone@gmail.com",
    body: "I want to give all the glory to God for the miraculous healing I received. For the past few months, I had been suffering from severe back pain that made it difficult to even get out of bed in the morning. I tried everything from medication to physical therapy, but nothing seemed to work. One Sunday, after service, I approached the prayer team and asked for prayers for healing. As they laid hands on me and prayed, I felt a warmth spread through my back, and the pain immediately started to decrease. By the time I got home that day, the pain was completely gone. It has now been three weeks, and I haven't felt even a hint of discomfort. I am so thankful to God for this miracle and want to encourage anyone who is struggling to believe in His power to heal. Our God is a healer, and He hears our prayers!",
    views: 66,
    likes: 21,
    comments: 12,
    shares: 17,
    thumbnailLabel: "Written Testimony",
    thumbnailSrc: "/admin-logo.svg",
    status: "Uploaded",
  },
  {
    id: 2,
    kind: "text",
    title: "Saved by Grace",
    category: "Salvation",
    source: "App submission",
    dateUploaded: "12/08/2024",
    uploadedBy: "Super Admin",
    submitterName: "Sarah James",
    submitterEmail: "sarahjames@gmail.com",
    body: "I had been far from God for years, but through a difficult season He drew me back and reminded me of His mercy. I surrendered my life fully to Christ and found a peace I never had before. I am grateful for His grace and for a church family that helped me find my way back.",
    views: 24,
    likes: 9,
    comments: 5,
    shares: 22,
    thumbnailLabel: "Written Testimony",
    thumbnailSrc: "/admin-logo.svg",
    status: "Uploaded",
  },
];

const tabs: Array<{ key: HomeManagementTab; label: string }> = [
  { key: "video", label: "Video Testimonies" },
  { key: "text", label: "Text Testimonies" },
  { key: "pictures", label: "Inspirational Pictures" },
];

function normalizeTab(tab?: string): HomeManagementTab {
  if (tab === "text" || tab === "pictures") return tab;
  return "video";
}

function normalizeDisplayRule(rule?: string): HomeManagementDisplayRule {
  if (rule === "Most Recent" || rule === "Most Shared") return rule;
  return "Trending";
}

function normalizePhaseState(value?: string): HomeManagementPhaseState {
  if (value === "loading" || value === "empty" || value === "error") return value;
  return "populated";
}

function normalizeTestimonyCount(value: string | undefined, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return max;
  return Math.min(Math.max(1, Math.floor(parsed)), max);
}

function toSortableDateValue(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return Number(`${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`);
}

function sortRows(rows: HomeManagementRow[], rule: HomeManagementDisplayRule) {
  const clonedRows = [...rows];

  if (rule === "Most Recent") {
    return clonedRows.sort((a, b) => toSortableDateValue(b.dateUploaded) - toSortableDateValue(a.dateUploaded));
  }

  if (rule === "Most Shared") {
    return clonedRows.sort((a, b) => b.shares - a.shares);
  }

  return clonedRows.sort(
    (a, b) =>
      b.views + b.likes + b.comments + b.shares - (a.views + a.likes + a.comments + a.shares),
  );
}

export function getHomeManagementViewModel(input: {
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
  const activeTab = normalizeTab(input.tab);
  const displayRule = normalizeDisplayRule(input.rule);
  const phaseState = normalizePhaseState(input.state);
  const sortedRows = sortRows(activeTab === "pictures" ? pictureRows : activeTab === "text" ? textRows : baseRows, displayRule);
  const testimonyCount = normalizeTestimonyCount(input.count, sortedRows.length);
  const rows = phaseState === "populated" ? sortedRows.slice(0, testimonyCount) : [];
  const selectedId = Number(input.menuId ?? input.viewId ?? input.removeId ?? "");
  const selectedRow = Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/home-management",
      fullName: input.fullName,
    }),
    activeTab,
    phaseState,
    displayRule,
    displayRuleOptions: DISPLAY_RULE_OPTIONS,
    testimonyCount,
    availableCount: sortedRows.length,
    errorMessage: phaseState === "error" ? "We could not load homepage content right now. Please try again." : undefined,
    tabs,
    rows,
    selectedRow,
    showActionMenu: Boolean(input.menuId),
    showDetails: Boolean(input.viewId),
    showRemoveConfirm: Boolean(input.removeId),
    showSuccess: input.success === "remove",
  };
}
