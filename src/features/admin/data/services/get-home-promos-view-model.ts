import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import { formatShowingLabel, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  HomePromoCtaDestination,
  HomePromoRow,
  HomePromosViewModel,
  HomePromoState,
  HomePromoStatus,
  HomePromoStatusFilter,
} from "@/features/admin/domain/entities/home-promos";

const statusTabs: Array<{ key: HomePromoStatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "ended", label: "Ended" },
  { key: "inactive", label: "Inactive" },
];

function normalizeStatus(status?: string): HomePromoStatusFilter {
  if (status === "active" || status === "scheduled" || status === "ended" || status === "inactive") return status;
  return "all";
}

function normalizeState(state?: string): HomePromoState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function normalizeCtaDestination(value: unknown): HomePromoCtaDestination {
  if (value === "giving" || value === "submit_testimony" || value === "external_url") return value;
  return "";
}

function normalizeRowStatus(value: unknown): HomePromoStatus {
  if (value === "active" || value === "scheduled" || value === "ended" || value === "inactive") return value;
  return "inactive";
}

function dateLabel(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function windowLabel(startsAt: string, endsAt: string): string {
  const start = dateLabel(startsAt);
  if (!endsAt) return `${start} – No end date`;
  return `${start} – ${dateLabel(endsAt)}`;
}

function mapRows(raw: Array<Record<string, unknown>>): HomePromoRow[] {
  return raw.map((item) => {
    const startsAt = String(item.starts_at ?? "");
    const endsAt = String(item.ends_at ?? "");
    return {
      id: Number(item.id),
      title: String(item.title ?? ""),
      body: String(item.body ?? ""),
      imageUrl: String(item.image_url ?? ""),
      ctaLabel: String(item.cta_label ?? ""),
      ctaDestination: normalizeCtaDestination(item.cta_destination),
      ctaUrl: String(item.cta_url ?? ""),
      startsAt,
      endsAt,
      isActive: Boolean(item.is_active),
      status: normalizeRowStatus(item.status),
      updatedByEmail: String(item.updated_by_email ?? ""),
      windowLabel: windowLabel(startsAt, endsAt),
    };
  });
}

function getSuccessMessage(kind?: string): string | undefined {
  if (kind === "create") return "Promo card created successfully.";
  if (kind === "update") return "Promo card updated successfully.";
  if (kind === "activate") return "Promo card activated.";
  if (kind === "deactivate") return "Promo card deactivated.";
  return undefined;
}

function baseViewModel(input: {
  status?: string;
  state?: string;
  q?: string;
  success?: string;
  fullName?: string;
  page?: string;
}): HomePromosViewModel {
  const page = parsePageParam(input.page);
  return {
    shell: getAdminShellViewModel({ activeHref: "/home-promos", fullName: input.fullName }),
    pageTitle: "Home Promos",
    pageDescription:
      "Write a native \"From iTestified\" card that appears woven into the mobile Home feed at a fixed cadence — house promotion only, never a third-party ad.",
    phaseState: normalizeState(input.state),
    activeStatus: normalizeStatus(input.status),
    searchQuery: input.q?.trim() ?? "",
    statusTabs,
    rows: [],
    totalRows: 0,
    showingLabel: "Showing 0 of 0",
    page,
    hasNextPage: false,
    hasPreviousPage: page > 1,
    errorMessage: input.state === "error" ? "We could not load promo cards right now. Please try again." : undefined,
    successMessage: getSuccessMessage(input.success),
    showSuccess: Boolean(getSuccessMessage(input.success)),
    editingRow: null,
  };
}

export function getHomePromosViewModel(input: {
  status?: string;
  state?: string;
  q?: string;
  success?: string;
  fullName?: string;
  page?: string;
}): HomePromosViewModel {
  return baseViewModel(input);
}

export async function getHomePromosViewModelFromApi(
  input: {
    status?: string;
    state?: string;
    q?: string;
    edit?: string;
    success?: string;
    fullName?: string;
    page?: string;
  },
  cookieHeader: string,
): Promise<HomePromosViewModel> {
  const vm = baseViewModel(input);
  try {
    const searchParams = new URLSearchParams();
    if (vm.activeStatus !== "all") searchParams.set("status", vm.activeStatus);
    if (vm.searchQuery) searchParams.set("q", vm.searchQuery);
    searchParams.set("page", String(vm.page));
    const url = `${backendBaseUrl}/content/admin/home-promos/?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...vm, phaseState: "error" };
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
    };
    const rows = mapRows(payload.results ?? []);
    const total = payload.count ?? rows.length;
    const editId = Number(input.edit ?? "");
    const editingRow = Number.isFinite(editId) ? rows.find((row) => row.id === editId) ?? null : null;

    return {
      ...vm,
      phaseState: vm.phaseState === "populated" ? (rows.length === 0 ? "empty" : "populated") : vm.phaseState,
      rows,
      totalRows: total,
      showingLabel: formatShowingLabel(vm.page, rows.length, total),
      hasNextPage: Boolean(payload.next),
      hasPreviousPage: Boolean(payload.previous) || vm.page > 1,
      editingRow,
    };
  } catch {
    return { ...vm, phaseState: "error" };
  }
}
