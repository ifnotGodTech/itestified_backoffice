import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import { formatShowingLabel, paginateRows, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  SubscriptionDetail,
  SubscriptionRow,
  SubscriptionTab,
  SubscriptionsState,
  SubscriptionsViewModel,
} from "@/features/admin/domain/entities/subscriptions";

const tabs: Array<{ key: SubscriptionTab; label: string }> = [
  { key: "all", label: "All Subscriptions" },
  { key: "active", label: "Active" },
  { key: "past_due", label: "Past Due" },
  { key: "pending", label: "Pending" },
  { key: "canceled", label: "Canceled" },
  { key: "expired", label: "Expired" },
];

const subscriptionRows: SubscriptionRow[] = [
  {
    id: 1,
    subscriber: "Ben Bruce",
    email: "amanda@site.so",
    amount: "₦3,000",
    currency: "Naira (₦)",
    date: "05 Aug, 2026",
    status: "active",
    reference: "SUB-KY23FN5325",
    renewsOn: "05 Sep, 2026",
    cancelAtPeriodEnd: false,
  },
  {
    id: 2,
    subscriber: "Adamu Johnson",
    email: "chomuncho@site.com",
    amount: "$4.99",
    currency: "Dollar ($)",
    date: "10 Aug, 2026",
    status: "pending",
    reference: "SUB-IY46HN5689",
    renewsOn: "—",
    cancelAtPeriodEnd: false,
  },
  {
    id: 3,
    subscriber: "Solomon King",
    email: "lewis@site.so",
    amount: "₦3,000",
    currency: "Naira (₦)",
    date: "01 Jul, 2026",
    status: "past_due",
    reference: "SUB-GH82FG578",
    renewsOn: "01 Aug, 2026",
    cancelAtPeriodEnd: false,
  },
  {
    id: 4,
    subscriber: "Cole Palmer",
    email: "cole@site.so",
    amount: "₦3,000",
    currency: "Naira (₦)",
    date: "16 Jun, 2026",
    status: "canceled",
    reference: "SUB-NG52KG878",
    renewsOn: "16 Jul, 2026",
    cancelAtPeriodEnd: true,
  },
];

function normalizeTab(tab?: string): SubscriptionTab {
  if (tab === "active" || tab === "past_due" || tab === "pending" || tab === "canceled" || tab === "expired") return tab;
  return "all";
}

function normalizeState(state?: string): SubscriptionsState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function filterRowsByTab(rows: SubscriptionRow[], activeTab: SubscriptionTab) {
  if (activeTab === "all") return rows;
  return rows.filter((row) => row.status === activeTab);
}

function getTableTitle(activeTab: SubscriptionTab) {
  if (activeTab === "active") return "Active Subscriptions";
  if (activeTab === "past_due") return "Past Due Subscriptions";
  if (activeTab === "pending") return "Pending Subscriptions";
  if (activeTab === "canceled") return "Canceled Subscriptions";
  if (activeTab === "expired") return "Expired Subscriptions";
  return "All Subscriptions";
}

function getSuccessMessage(kind?: string) {
  if (kind === "cancel") return "Subscription canceled successfully!";
  return undefined;
}

export function getSubscriptionsViewModel(input: {
  tab?: string;
  state?: string;
  q?: string;
  menu?: string;
  detail?: string;
  cancel?: string;
  reason?: string;
  success?: string;
  fullName?: string;
  page?: string;
}): SubscriptionsViewModel {
  const activeTab = normalizeTab(input.tab);
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";

  const tabRows = filterRowsByTab(subscriptionRows, activeTab);
  const searchedRows = searchQuery
    ? tabRows.filter((row) =>
        `${row.subscriber} ${row.email} ${row.reference}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tabRows;
  const allRows = phaseState === "populated" ? searchedRows : [];
  const page = parsePageParam(input.page);
  const { pageRows: rows, hasNextPage, hasPreviousPage } = paginateRows(allRows, page);

  const selectedId = Number(input.menu ?? input.detail ?? input.cancel ?? input.reason ?? "");
  const selectedRow = Number.isFinite(selectedId) ? subscriptionRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage = getSuccessMessage(input.success);

  return {
    shell: getAdminShellViewModel({ activeHref: "/subscriptions", fullName: input.fullName }),
    activeTab,
    phaseState,
    pageTitle: "Subscriptions",
    pageDescription: "View premium subscribers and manage their subscriptions.",
    searchQuery,
    tabs,
    rows,
    selectedRow,
    showingLabel: formatShowingLabel(page, rows.length, allRows.length),
    page,
    hasNextPage,
    hasPreviousPage,
    errorMessage: phaseState === "error" ? "We could not load subscriptions right now. Please try again." : undefined,
    searchPlaceholder: "Search by email, name, or reference....",
    topStats:
      phaseState === "error"
        ? [{ label: "Subscribers (—)", value: "", tone: "info" }]
        : [{ label: `Subscribers (${subscriptionRows.length})`, value: "", tone: "info" }],
    tableTitle: getTableTitle(activeTab),
    tableBadge: phaseState === "error" ? { subscribersLabel: "Subscribers (—)" } : { subscribersLabel: `Subscribers (${rows.length})` },
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.detail),
    showCancelConfirm: Boolean(input.cancel),
    showReasonModal: Boolean(input.reason),
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}

function formatAmount(amountMinor: number, currency: string) {
  const symbol = currency === "USD" ? "$" : "₦";
  const amountMajor = amountMinor / 100;
  // USD always shows cents (matches the exact price charged); NGN stays
  // whole, matching this project's existing donations/mobile convention.
  return currency === "USD"
    ? `${symbol}${amountMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${symbol}${amountMajor.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function toDateLabel(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapStatus(status: string): SubscriptionTab {
  if (status === "active" || status === "past_due" || status === "pending" || status === "canceled" || status === "expired") {
    return status;
  }
  return "pending";
}

function mapCurrencyLabel(currency: string) {
  return currency === "USD" ? "Dollar ($)" : "Naira (₦)";
}

function mapRows(results: Array<Record<string, unknown>>): SubscriptionRow[] {
  return results.map((item) => {
    const amountMinor = Number(item.amount ?? 0);
    const currency = String(item.currency ?? "NGN");
    return {
      id: Number(item.id ?? 0),
      subscriber: String(item.subscriber_name ?? ""),
      email: String(item.subscriber_email ?? ""),
      amount: formatAmount(amountMinor, currency),
      currency: mapCurrencyLabel(currency),
      date: toDateLabel(String(item.created_at ?? "")),
      status: mapStatus(String(item.status ?? "")),
      reference: String(item.payment_reference ?? ""),
      renewsOn: toDateLabel(String(item.current_period_end ?? "")),
      cancelAtPeriodEnd: Boolean(item.cancel_at_period_end),
    };
  });
}

export function mapSubscriptionDetail(item: Record<string, unknown>): SubscriptionDetail {
  const amountMinor = Number(item.amount ?? 0);
  const currency = String(item.currency ?? "NGN");
  const rawHistory = Array.isArray(item.status_history) ? (item.status_history as Array<Record<string, unknown>>) : [];

  return {
    id: Number(item.id ?? 0),
    subscriber: String(item.subscriber_name ?? ""),
    email: String(item.subscriber_email ?? ""),
    amount: formatAmount(amountMinor, currency),
    currency: mapCurrencyLabel(currency),
    date: toDateLabel(String(item.created_at ?? "")),
    status: mapStatus(String(item.status ?? "")),
    reference: String(item.payment_reference ?? ""),
    renewsOn: toDateLabel(String(item.current_period_end ?? "")),
    cancelAtPeriodEnd: Boolean(item.cancel_at_period_end),
    providerSubscriptionId: String(item.provider_subscription_id ?? ""),
    statusReason: String(item.status_reason ?? ""),
    statusHistory: rawHistory.map((entry) => ({
      id: Number(entry.id ?? 0),
      fromStatus: String(entry.from_status ?? ""),
      toStatus: String(entry.to_status ?? ""),
      reason: String(entry.reason ?? ""),
      actorEmail: String(entry.actor_email ?? ""),
      date: toDateLabel(String(entry.created_at ?? "")),
    })),
  };
}

export async function getSubscriptionsViewModelFromApi(
  input: {
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    detail?: string;
    cancel?: string;
    reason?: string;
    success?: string;
    fullName?: string;
    page?: string;
  },
  cookieHeader: string,
): Promise<SubscriptionsViewModel> {
  const page = parsePageParam(input.page);
  try {
    const activeTab = normalizeTab(input.tab);
    const searchParams = new URLSearchParams();
    if (activeTab !== "all") searchParams.set("status", activeTab);
    if (input.q?.trim()) searchParams.set("q", input.q.trim());
    searchParams.set("page", String(page));
    const query = searchParams.toString();
    const url = `${backendBaseUrl}/subscriptions/admin/subscriptions/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...getSubscriptionsViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
    };
    const rawResults = payload.results ?? [];
    const rows = mapRows(rawResults);
    const vm = getSubscriptionsViewModel(input);
    const total = payload.count ?? rows.length;

    return {
      ...vm,
      phaseState: rows.length === 0 ? "empty" : "populated",
      rows,
      selectedRow: (() => {
        const selectedId = Number(input.menu ?? input.detail ?? input.cancel ?? input.reason ?? "");
        return Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;
      })(),
      showingLabel: formatShowingLabel(page, rows.length, total),
      page,
      hasNextPage: Boolean(payload.next),
      hasPreviousPage: Boolean(payload.previous) || page > 1,
      topStats: [{ label: `Subscribers (${total})`, value: "", tone: "info" as const }],
      tableBadge: { subscribersLabel: `Subscribers (${rows.length})` },
    };
  } catch {
    return { ...getSubscriptionsViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
  }
}
