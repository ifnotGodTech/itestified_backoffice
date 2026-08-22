import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import { formatShowingLabel, paginateRows, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  ReferralCommissionRow,
  ReferralCommissionTab,
  ReferralCommissionsState,
  ReferralCommissionsViewModel,
} from "@/features/admin/domain/entities/referral-commissions";

const tabs: Array<{ key: ReferralCommissionTab; label: string }> = [
  { key: "unpaid", label: "Unpaid" },
  { key: "paid", label: "Paid" },
  { key: "all", label: "All" },
];

const commissionRows: ReferralCommissionRow[] = [
  {
    id: 1,
    referrerEmail: "grace.restoration@example.com",
    referredUserEmail: "new.subscriber1@example.com",
    amount: 45000,
    currency: "NGN",
    ratePercent: "15.00",
    billingPeriodEnd: "2026-09-21T15:36:03Z",
    isPaid: false,
    paidAt: null,
    paidByEmail: null,
    createdAt: "2026-08-21T15:36:03Z",
  },
  {
    id: 2,
    referrerEmail: "office@newlifefellowship.org",
    referredUserEmail: "new.subscriber2@example.com",
    amount: 7500,
    currency: "USD",
    ratePercent: "15.00",
    billingPeriodEnd: "2026-08-15T09:00:00Z",
    isPaid: true,
    paidAt: "2026-08-16T10:00:00Z",
    paidByEmail: "admin@itestified.app",
    createdAt: "2026-07-15T09:00:00Z",
  },
];

function normalizeTab(tab?: string): ReferralCommissionTab {
  if (tab === "paid" || tab === "all") return tab;
  return "unpaid";
}

function normalizeState(state?: string): ReferralCommissionsState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function filterRowsByTab(rows: ReferralCommissionRow[], activeTab: ReferralCommissionTab) {
  if (activeTab === "all") return rows;
  if (activeTab === "paid") return rows.filter((row) => row.isPaid);
  return rows.filter((row) => !row.isPaid);
}

function getTableTitle(activeTab: ReferralCommissionTab) {
  if (activeTab === "paid") return "Paid Commissions";
  if (activeTab === "all") return "All Commissions";
  return "Unpaid Commissions";
}

function getSuccessMessage(kind?: string) {
  if (kind === "mark-paid") return "Commission marked as paid!";
  return undefined;
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getReferralCommissionsViewModel(input: {
  tab?: string;
  state?: string;
  q?: string;
  menu?: string;
  markPaid?: string;
  success?: string;
  fullName?: string;
  page?: string;
}): ReferralCommissionsViewModel {
  const activeTab = normalizeTab(input.tab);
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";

  const tabRows = filterRowsByTab(commissionRows, activeTab);
  const searchedRows = searchQuery
    ? tabRows.filter((row) =>
        `${row.referrerEmail} ${row.referredUserEmail}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tabRows;
  const allRows = phaseState === "populated" ? searchedRows : [];
  const page = parsePageParam(input.page);
  const { pageRows: rows, hasNextPage, hasPreviousPage } = paginateRows(allRows, page);

  const selectedId = Number(input.menu ?? input.markPaid ?? "");
  const selectedRow = Number.isFinite(selectedId) ? commissionRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage = getSuccessMessage(input.success);

  const totalsByCurrency = new Map<string, number>();
  for (const row of allRows) {
    totalsByCurrency.set(row.currency, (totalsByCurrency.get(row.currency) ?? 0) + row.amount);
  }

  return {
    shell: getAdminShellViewModel({ activeHref: "/referral-payouts", fullName: input.fullName }),
    activeTab,
    phaseState,
    pageTitle: "Referral Payouts",
    pageDescription:
      "Review commission earned by referrers each billing cycle and mark month-end payouts once the manual bank transfer is done.",
    searchQuery,
    tabs,
    rows,
    selectedRow,
    showingLabel: formatShowingLabel(page, rows.length, allRows.length),
    page,
    hasNextPage,
    hasPreviousPage,
    errorMessage: phaseState === "error" ? "We could not load the commission ledger right now. Please try again." : undefined,
    searchPlaceholder: "Search by referrer or referred email…",
    topStats:
      phaseState === "error"
        ? [{ label: "Total (—)", value: "", tone: "info" }]
        : totalsByCurrency.size === 0
          ? [{ label: "Total (0)", value: "", tone: "info" }]
          : Array.from(totalsByCurrency.entries()).map(([currency, amount]) => ({
              label: formatAmount(amount, currency),
              value: "",
              tone: "accent" as const,
            })),
    tableTitle: getTableTitle(activeTab),
    tableBadge: phaseState === "error" ? { totalLabel: "Total (—)" } : { totalLabel: `Total (${rows.length})` },
    showActionMenu: Boolean(input.menu),
    showMarkPaidConfirm: Boolean(input.markPaid),
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}

export function toDateLabel(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapRows(results: Array<Record<string, unknown>>): ReferralCommissionRow[] {
  return results.map((item) => ({
    id: Number(item.id ?? 0),
    referrerEmail: String(item.referrer_email ?? ""),
    referredUserEmail: String(item.referred_user_email ?? ""),
    amount: Number(item.amount ?? 0),
    currency: String(item.currency ?? ""),
    ratePercent: String(item.rate_percent ?? "0.00"),
    billingPeriodEnd: String(item.billing_period_end ?? ""),
    isPaid: Boolean(item.is_paid),
    paidAt: (item.paid_at as string | null) ?? null,
    paidByEmail: (item.paid_by_email as string | null) || null,
    createdAt: String(item.created_at ?? ""),
  }));
}

export async function getReferralCommissionsViewModelFromApi(
  input: {
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    markPaid?: string;
    success?: string;
    fullName?: string;
    page?: string;
  },
  cookieHeader: string,
): Promise<ReferralCommissionsViewModel> {
  const page = parsePageParam(input.page);
  try {
    const activeTab = normalizeTab(input.tab);
    const searchParams = new URLSearchParams();
    if (activeTab === "unpaid") searchParams.set("is_paid", "false");
    if (activeTab === "paid") searchParams.set("is_paid", "true");
    if (input.q?.trim()) searchParams.set("q", input.q.trim());
    searchParams.set("page", String(page));
    const query = searchParams.toString();
    const url = `${backendBaseUrl}/referrals/admin/commissions/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...getReferralCommissionsViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
      totals?: Array<{ currency: string; amount: number }>;
    };
    const rawResults = payload.results ?? [];
    const rows = mapRows(rawResults);
    const vm = getReferralCommissionsViewModel(input);
    const total = payload.count ?? rows.length;
    const totals = payload.totals ?? [];

    return {
      ...vm,
      phaseState: rows.length === 0 ? "empty" : "populated",
      rows,
      selectedRow: (() => {
        const selectedId = Number(input.menu ?? input.markPaid ?? "");
        return Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;
      })(),
      showingLabel: formatShowingLabel(page, rows.length, total),
      page,
      hasNextPage: Boolean(payload.next),
      hasPreviousPage: Boolean(payload.previous) || page > 1,
      topStats:
        totals.length === 0
          ? [{ label: "Total (0)", value: "", tone: "info" as const }]
          : totals.map((t) => ({ label: formatAmount(t.amount, t.currency), value: "", tone: "accent" as const })),
      tableBadge: { totalLabel: `Total (${rows.length})` },
    };
  } catch {
    return { ...getReferralCommissionsViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
  }
}
