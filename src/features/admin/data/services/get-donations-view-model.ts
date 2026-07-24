import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import { formatShowingLabel, paginateRows, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  DonationRow,
  DonationTab,
  DonationsFilterDraft,
  DonationsState,
  DonationsViewModel,
} from "@/features/admin/domain/entities/donations";

const tabs: Array<{ key: DonationTab; label: string }> = [
  { key: "all", label: "All Donations" },
  { key: "successful", label: "Successful" },
  { key: "pending", label: "Pending" },
  { key: "declined", label: "Declined" },
  { key: "reversal", label: "Reversal" },
];

const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August"] as const;

const donationRows: DonationRow[] = [
  {
    id: 1,
    donor: "Ben Bruce",
    email: "amanda@site.so",
    amount: "₦5,000",
    currency: "Naira (₦)",
    date: "05 Aug, 2025",
    status: "successful",
    reference: "KY23FN5325",
    paymentMethod: "Visa",
    paymentMask: "****3709",
  },
  {
    id: 2,
    donor: "Adamu Johnson",
    email: "chomuncho@site.com",
    amount: "$10,000",
    currency: "Dollar ($)",
    date: "10 Aug, 2025",
    status: "pending",
    reference: "IY46HN5689",
    paymentMethod: "Mastercard",
    paymentMask: "****7645",
  },
  {
    id: 3,
    donor: "Solomon King",
    email: "lewis@site.so",
    amount: "₦8,000",
    currency: "Naira (₦)",
    date: "12 Aug, 2025",
    status: "declined",
    reference: "GH82FG578",
    paymentMethod: "Bank",
    paymentMask: "****2890",
  },
  {
    id: 4,
    donor: "Cole plamer",
    email: "cole@site.so",
    amount: "₦1,000",
    currency: "Naira (₦)",
    date: "16 Aug, 2025",
    status: "successful",
    reference: "NG52KG878",
    paymentMethod: "Bank",
    paymentMask: "****7689",
  },
];

function normalizeTab(tab?: string): DonationTab {
  if (tab === "successful" || tab === "pending" || tab === "declined" || tab === "reversal") return tab;
  return "all";
}

function normalizeState(state?: string): DonationsState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function normalizeStatusFilter(status?: string): DonationTab | undefined {
  if (status === "successful" || status === "pending" || status === "declined") return status;
  return undefined;
}

function normalizeCurrencyFilter(currency?: string) {
  if (currency === "Naira" || currency === "Dollar") return currency;
  return undefined;
}

function filterRowsByTab(rows: DonationRow[], activeTab: DonationTab) {
  if (activeTab === "all") return rows;
  if (activeTab === "reversal") return rows.filter((row) => row.status === "successful");
  return rows.filter((row) => row.status === activeTab);
}

function applyFilter(rows: DonationRow[], filterDraft: DonationsFilterDraft) {
  return rows.filter((row) => {
    if (filterDraft.currency === "Naira" && !row.amount.includes("₦")) return false;
    if (filterDraft.currency === "Dollar" && !row.amount.includes("$")) return false;
    if (filterDraft.status && row.status !== filterDraft.status) return false;
    return true;
  });
}

function getHeroCard(activeTab: DonationTab): DonationsViewModel["heroCard"] {
  if (activeTab === "successful") {
    return {
      label: "Total Successful Donation",
      value: "₦1,000,000",
      hint: "Total amount Pending for last 30 days",
      trend: "0.32%",
    };
  }

  if (activeTab === "pending") {
    return {
      label: "Total Pending Donation",
      value: "₦15,000,000",
      hint: "Total amount Pending for last 30 days",
      trend: "0.32%",
    };
  }

  if (activeTab === "declined") {
    return {
      label: "Total Declined Donation",
      value: "₦3,000,000",
      hint: "Total amount Pending for last 30 days",
      trend: "0.32%",
    };
  }

  return undefined;
}

function getTableTitle(activeTab: DonationTab) {
  if (activeTab === "successful") return "Successful Donations";
  if (activeTab === "pending") return "Pending Donations";
  if (activeTab === "declined") return "Declined Donations";
  if (activeTab === "reversal") return "Reversal";
  return "All Donations";
}

function getTableBadge(activeTab: DonationTab, rows: DonationRow[]) {
  const totalLabel =
    activeTab === "successful"
      ? "Successful Donations (₦5,000)"
      : activeTab === "pending"
        ? "Pending Donations ($10,000)"
        : activeTab === "declined"
          ? "Declined Donations (₦8,000)"
          : "Total Donations (₦1,000,000)";

  const totalTone =
    activeTab === "successful"
      ? "success"
      : activeTab === "pending"
        ? "warning"
        : activeTab === "declined"
          ? "danger"
          : "info";

  return {
    donorsLabel: `Donors (${rows.length})`,
    totalLabel,
    totalTone,
  } as const;
}

function getSuccessMessage(kind?: string) {
  if (kind === "refund") return "Refund Successful";
  if (kind === "reverse") return "Donation reversed successfully!";
  if (kind === "delete") return "Donation deleted successfully!";
  return undefined;
}

export function getDonationsViewModel(input: {
  tab?: string;
  state?: string;
  month?: string;
  monthMenu?: string;
  q?: string;
  filter?: string;
  minAmount?: string;
  maxAmount?: string;
  currency?: string;
  from?: string;
  to?: string;
  statusFilter?: string;
  menu?: string;
  detail?: string;
  refund?: string;
  reverse?: string;
  reason?: string;
  remove?: string;
  success?: string;
  fullName?: string;
  page?: string;
}): DonationsViewModel {
  const activeTab = normalizeTab(input.tab);
  const phaseState = normalizeState(input.state);
  const selectedMonth = monthOptions.includes((input.month as typeof monthOptions[number]) ?? "June")
    ? ((input.month as typeof monthOptions[number]) ?? "June")
    : "June";
  const searchQuery = input.q?.trim() ?? "";
  const filterDraft: DonationsFilterDraft = {
    minAmount: input.minAmount?.trim() || undefined,
    maxAmount: input.maxAmount?.trim() || undefined,
    currency: normalizeCurrencyFilter(input.currency),
    status: normalizeStatusFilter(input.statusFilter),
    from: input.from?.trim() || undefined,
    to: input.to?.trim() || undefined,
  };

  const tabRows = filterRowsByTab(donationRows, activeTab);
  const searchedRows = searchQuery
    ? tabRows.filter((row) =>
        `${row.donor} ${row.email} ${row.reference} ${row.amount}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tabRows;
  const filteredRows = applyFilter(searchedRows, filterDraft);
  const allRows = phaseState === "populated" ? filteredRows : [];
  const page = parsePageParam(input.page);
  const { pageRows: rows, hasNextPage, hasPreviousPage } = paginateRows(allRows, page);

  const selectedId = Number(input.menu ?? input.detail ?? input.refund ?? input.reverse ?? input.reason ?? input.remove ?? "");
  const selectedRow = Number.isFinite(selectedId) ? donationRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage = getSuccessMessage(input.success);

  return {
    shell: getAdminShellViewModel({
      activeHref: "/donations",
      fullName: input.fullName,
    }),
    activeTab,
    phaseState,
    pageTitle: "Donations history",
    pageDescription: "View your donations and manage transactions.",
    selectedMonth,
    monthOptions: [...monthOptions],
    searchQuery,
    tabs,
    rows,
    selectedRow,
    showingLabel: formatShowingLabel(page, rows.length, allRows.length),
    page,
    hasNextPage,
    hasPreviousPage,
    errorMessage: phaseState === "error" ? "We could not load donations right now. Please try again." : undefined,
    filterDraft,
    searchPlaceholder: "Search by Email, Transaction ID or Amount....",
    topStats:
      phaseState === "error"
        ? [
            { label: "Donors (—)", value: "", tone: "info" },
            { label: "Total Donations (—)", value: "", tone: "accent" },
          ]
        : [
            { label: `Donors (${donationRows.length - 1})`, value: "", tone: "info" },
            { label: "Total Donations (₦1,000,000)", value: "", tone: "accent" },
          ],
    heroCard: getHeroCard(activeTab),
    tableTitle: getTableTitle(activeTab),
    tableBadge: getTableBadge(activeTab, rows),
    summary: {
      cards: [],
    },
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.detail),
    showMonthMenu: input.monthMenu === "1",
    showFilterModal: input.filter === "1",
    showRefundConfirm: Boolean(input.refund),
    showReverseConfirm: Boolean(input.reverse),
    showDeleteConfirm: Boolean(input.remove),
    showReasonModal: Boolean(input.reason),
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}

function formatAmount(amountMinor: number, currency: string) {
  const symbol = currency === "USD" ? "$" : "₦";
  const amountMajor = amountMinor / 100;
  return `${symbol}${amountMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapStatus(status: string): DonationTab {
  if (status === "successful" || status === "pending" || status === "declined") return status;
  return "reversal";
}

function mapCurrencyLabel(currency: string) {
  return currency === "USD" ? "Dollar ($)" : "Naira (₦)";
}

function mapRows(results: Array<Record<string, unknown>>): DonationRow[] {
  return results.map((item) => {
    const amountMinor = Number(item.amount ?? 0);
    const currency = String(item.currency ?? "NGN");
    const providerTransactionId = String(item.provider_transaction_id ?? "");
    return {
      id: Number(item.id ?? 0),
      donor: String(item.donor_name ?? ""),
      email: String(item.donor_email ?? ""),
      amount: formatAmount(amountMinor, currency),
      currency: mapCurrencyLabel(currency),
      date: toDateLabel(String(item.created_at ?? "")),
      status: mapStatus(String(item.status ?? "")),
      reference: String(item.payment_reference ?? ""),
      paymentMethod: "Flutterwave",
      paymentMask: providerTransactionId ? `****${providerTransactionId.slice(-4)}` : "****0000",
    };
  });
}

function getTotalDonationsLabel(results: Array<Record<string, unknown>>): string {
  if (results.length === 0) return "Total Donations (₦0.00)";
  const currencies = new Set(results.map((item) => String(item.currency ?? "NGN")));
  if (currencies.size > 1) return "Total Donations (Mixed currencies)";
  const currency = String(results[0]?.currency ?? "NGN");
  const totalMinor = results.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  return `Total Donations (${formatAmount(totalMinor, currency)})`;
}

export async function getDonationsViewModelFromApi(
  input: {
    tab?: string;
    state?: string;
    month?: string;
    monthMenu?: string;
    q?: string;
    filter?: string;
    minAmount?: string;
    maxAmount?: string;
    currency?: string;
    from?: string;
    to?: string;
    statusFilter?: string;
    menu?: string;
    detail?: string;
    refund?: string;
    reverse?: string;
    reason?: string;
    remove?: string;
    success?: string;
    fullName?: string;
    page?: string;
  },
  cookieHeader: string,
): Promise<DonationsViewModel> {
  const page = parsePageParam(input.page);
  try {
    const activeTab = normalizeTab(input.tab);
    const statusFilter =
      activeTab === "all" ? input.statusFilter : activeTab === "reversal" ? "reversed" : activeTab;
    const searchParams = new URLSearchParams();
    if (statusFilter) searchParams.set("status", statusFilter);
    if (input.q?.trim()) searchParams.set("q", input.q.trim());
    if (input.from?.trim()) searchParams.set("from", input.from.trim());
    if (input.to?.trim()) searchParams.set("to", input.to.trim());
    searchParams.set("page", String(page));
    const query = searchParams.toString();
    const url = `${backendBaseUrl}/donations/admin/donations/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...getDonationsViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
    };
    const rawResults = payload.results ?? [];
    const rows = mapRows(rawResults);
    const vm = getDonationsViewModel(input);
    const total = payload.count ?? rows.length;
    return {
      ...vm,
      phaseState: rows.length === 0 ? "empty" : "populated",
      rows,
      selectedRow: (() => {
        const selectedId = Number(input.menu ?? input.detail ?? input.refund ?? input.reverse ?? input.reason ?? input.remove ?? "");
        return Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null;
      })(),
      showingLabel: formatShowingLabel(page, rows.length, total),
      page,
      hasNextPage: Boolean(payload.next),
      hasPreviousPage: Boolean(payload.previous) || page > 1,
      topStats: [
        { label: `Donors (${rows.length})`, value: "", tone: "info" as const },
        { label: getTotalDonationsLabel(rawResults), value: "", tone: "accent" as const },
      ],
      tableBadge: getTableBadge(vm.activeTab, rows),
    };
  } catch {
    return { ...getDonationsViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
  }
}
