import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

// Phase 35 Slice 6: the reactions people tap to respond to a testimony,
// managed per category.

export type ReactionIconOption = { key: string; emoji: string };

export type AdminReaction = {
  id: number;
  key: string;
  label: string;
  icon: string;
  emoji: string;
  isActive: boolean;
  inDefaultSet: boolean;
  /** Names of the categories whose own set includes it. */
  categories: string[];
  responseCount: number;
};

export type ReactionCategory = {
  id: number;
  name: string;
  isActive: boolean;
  /** Its own set, in order; empty means it uses the default set. */
  reactionIds: number[];
};

export type ReactionsData = {
  maxPerSet: number;
  icons: ReactionIconOption[];
  reactions: AdminReaction[];
  defaultSet: number[];
  categories: ReactionCategory[];
};

export type ReactionsView = "catalogue" | "sets";

/** Which set the Category sets view is editing. */
export type ReactionSetTarget = "default" | number;

export type ReactionsViewModel = {
  shell: AdminShellViewModel;
  view: ReactionsView;
  target: ReactionSetTarget;
  phaseState: "populated" | "error";
  data: ReactionsData | null;
  errorMessage?: string;
};

/** What the page asks the proxy to do. */
export type ReactionsAction =
  | { action: "create"; label: string; icon: string }
  | { action: "edit"; id: number; label: string; icon: string }
  | { action: "retire"; id: number }
  | { action: "restore"; id: number }
  | { action: "set"; target: ReactionSetTarget; reactionIds: number[] };
