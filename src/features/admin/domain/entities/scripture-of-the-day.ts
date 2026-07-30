import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

export type ScriptureStatus = "Uploaded" | "Scheduled";
export type ScriptureTab = "all" | "uploaded" | "scheduled";
export type ScriptureState = "populated" | "empty" | "loading" | "error";

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
  date: string;
};

export type ScriptureFilterDraft = {
  from: string;
  to: string;
  status: "" | "Uploaded" | "Scheduled";
};

// Phase 17 Slice 4: lets an admin see whether the streak feature is
// actually being used. "Active" means read today or yesterday -- see the
// backend's scripture_streak_engagement_stats() for why a stale streak
// isn't counted even though its streak_count hasn't reset to 0 yet.
export type ScriptureStreakStats = {
  activeStreakUserCount: number;
  streakLengthDistribution: {
    oneToThreeDays: number;
    fourToSevenDays: number;
    eightToThirtyDays: number;
    thirtyOnePlusDays: number;
  };
};

export type ScriptureOfTheDayViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  activeTab: ScriptureTab;
  tabs: Array<{ key: ScriptureTab; label: string }>;
  phaseState: ScriptureState;
  errorMessage?: string;
  formError?: string;
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
  streakStats: ScriptureStreakStats | null;
  actionItems: Array<{
    label: string;
    href: string;
    active: boolean;
  }>;
};
