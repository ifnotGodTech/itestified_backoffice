import type { ReferralCommissionTab, ReferralCommissionsState } from "@/features/admin/domain/entities/referral-commissions";

export type ReferralCommissionsRouteParams = {
  tab?: ReferralCommissionTab | null;
  state?: ReferralCommissionsState | null;
  q?: string | null;
  menu?: number | null;
  markPaid?: number | null;
  success?: string | null;
  page?: number | null;
};

export function buildReferralCommissionsHref(params: ReferralCommissionsRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "unpaid") search.set("tab", params.tab);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.markPaid) search.set("markPaid", String(params.markPaid));
  if (params.success) search.set("success", params.success);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/referral-payouts?${query}` : "/referral-payouts";
}
