import type { DonationTab, DonationsState } from "@/features/admin/domain/entities/donations";

export type DonationsRouteParams = {
  tab?: DonationTab | null;
  state?: DonationsState | null;
  month?: string | null;
  monthMenu?: boolean | null;
  q?: string | null;
  filter?: boolean | null;
  minAmount?: string | null;
  maxAmount?: string | null;
  currency?: string | null;
  from?: string | null;
  to?: string | null;
  statusFilter?: DonationTab | null;
  menu?: number | null;
  refund?: number | null;
  reverse?: number | null;
  reason?: number | null;
  remove?: number | null;
  success?: string | null;
};

export function buildDonationsHref(params: DonationsRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "all") search.set("tab", params.tab);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.month && params.month !== "June") search.set("month", params.month);
  if (params.monthMenu) search.set("monthMenu", "1");
  if (params.q) search.set("q", params.q);
  if (params.filter) search.set("filter", "1");
  if (params.minAmount) search.set("minAmount", params.minAmount);
  if (params.maxAmount) search.set("maxAmount", params.maxAmount);
  if (params.currency) search.set("currency", params.currency);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.statusFilter) search.set("statusFilter", params.statusFilter);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.refund) search.set("refund", String(params.refund));
  if (params.reverse) search.set("reverse", String(params.reverse));
  if (params.reason) search.set("reason", String(params.reason));
  if (params.remove) search.set("remove", String(params.remove));
  if (params.success) search.set("success", params.success);
  const query = search.toString();
  return query ? `/donations?${query}` : "/donations";
}
