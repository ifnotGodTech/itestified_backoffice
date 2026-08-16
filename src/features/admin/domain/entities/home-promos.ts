import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

export type HomePromoState = "populated" | "empty" | "loading" | "error";
export type HomePromoStatusFilter = "all" | "active" | "scheduled" | "ended" | "inactive";
export type HomePromoStatus = Exclude<HomePromoStatusFilter, "all">;
export type HomePromoCtaDestination = "" | "giving" | "submit_testimony" | "external_url";

export type HomePromoRow = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaDestination: HomePromoCtaDestination;
  ctaUrl: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  status: HomePromoStatus;
  updatedByEmail: string;
  windowLabel: string;
};

export type HomePromosViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: HomePromoState;
  activeStatus: HomePromoStatusFilter;
  searchQuery: string;
  statusTabs: Array<{ key: HomePromoStatusFilter; label: string }>;
  rows: HomePromoRow[];
  totalRows: number;
  showingLabel: string;
  errorMessage?: string;
  successMessage?: string;
  showSuccess: boolean;
  editingRow: HomePromoRow | null;
};
