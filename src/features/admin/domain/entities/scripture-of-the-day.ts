import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type ScriptureStatus = "Uploaded" | "Scheduled";
export type ScriptureTab = "all" | "uploaded" | "scheduled";

export type ScriptureRow = {
  id: number;
  date: string;
  bibleText: string;
  scripture: string;
  prayer: string;
  bibleVersion: string;
  status: ScriptureStatus;
  scheduledDate?: string;
  scheduledTime?: string;
};

export type ScriptureDraft = {
  scripture: string;
  prayer: string;
  bibleText: string;
  bibleVersion: string;
};

export type ScriptureFilterDraft = {
  from: string;
  to: string;
  status: "" | "Uploaded" | "Scheduled";
};

export type ScriptureOfTheDayViewModel = {
  shell: AdminShellViewModel;
  activeTab: ScriptureTab;
  tabs: Array<{ key: ScriptureTab; label: string }>;
  searchQuery: string;
  rows: ScriptureRow[];
  totalRows: number;
  showingLabel: string;
  selectedRow: ScriptureRow | null;
  editDraft: ScriptureDraft;
  showActionMenu: boolean;
  showDetails: boolean;
  showEdit: boolean;
  showDeleteConfirm: boolean;
  showFilterModal: boolean;
  showScheduleBuilder: boolean;
  isCreatingNew: boolean;
  saved: boolean;
  deleteSuccess: boolean;
  scheduleEntryCount: number;
  filterDraft: ScriptureFilterDraft;
  actionItems: Array<{
    label: string;
    href: string;
    active: boolean;
  }>;
};
