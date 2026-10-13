import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

// Phase 34 Slice 8: which Bibles readers can download in the app.

export type BiblePackKind = "version" | "study";

export type BiblePackRow = {
  code: string;
  kind: BiblePackKind;
  name: string;
  abbreviation: string;
  description: string;
  attribution: string;
  supportsWordStudy: boolean;
  sizeBytes: number;
  dataVersion: number;
  isEnabled: boolean;
  isDefault: boolean;
  updatedAt: string | null;
  /** Null when hiding is allowed; otherwise why not, in plain words. */
  hideBlockedReason: string | null;
  canMakeDefault: boolean;
};

export type BiblePackChangeRow = {
  packName: string;
  action: "enabled" | "disabled" | "made_default";
  actorName: string;
  createdAt: string;
};

export type BiblePacksState = "populated" | "success" | "refused" | "error";

export type BiblePacksViewModel = {
  shell: AdminShellViewModel;
  phaseState: BiblePacksState;
  versions: BiblePackRow[];
  studyPacks: BiblePackRow[];
  changes: BiblePackChangeRow[];
  /** The pack whose hiding is being confirmed (?confirm=hide&code=…). */
  confirmHide: BiblePackRow | null;
  bannerMessage?: string;
  errorMessage?: string;
};
