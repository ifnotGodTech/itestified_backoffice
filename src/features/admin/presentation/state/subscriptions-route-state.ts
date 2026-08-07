import type { SubscriptionTab, SubscriptionsState } from "@/features/admin/domain/entities/subscriptions";

export type SubscriptionsRouteParams = {
  tab?: SubscriptionTab | null;
  state?: SubscriptionsState | null;
  q?: string | null;
  menu?: number | null;
  detail?: number | null;
  cancel?: number | null;
  reason?: number | null;
  success?: string | null;
  page?: number | null;
};

export function buildSubscriptionsHref(params: SubscriptionsRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "all") search.set("tab", params.tab);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.detail) search.set("detail", String(params.detail));
  if (params.cancel) search.set("cancel", String(params.cancel));
  if (params.reason) search.set("reason", String(params.reason));
  if (params.success) search.set("success", params.success);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/subscriptions?${query}` : "/subscriptions";
}
