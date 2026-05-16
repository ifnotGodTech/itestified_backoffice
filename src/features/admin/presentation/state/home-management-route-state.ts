import type { HomeManagementDisplayRule, HomeManagementPhaseState, HomeManagementTab } from "@/features/admin/domain/entities/home-management";

export type HomeManagementRouteParams = {
  tab: HomeManagementTab;
  rule?: HomeManagementDisplayRule | null;
  count?: number | null;
  state?: HomeManagementPhaseState | null;
  menuId?: number | null;
  viewId?: number | null;
  removeId?: number | null;
  success?: string | null;
};

export function buildHomeManagementHref(params: HomeManagementRouteParams) {
  const search = new URLSearchParams();
  search.set("tab", params.tab);
  if (params.rule) search.set("rule", params.rule);
  if (params.count) search.set("count", String(params.count));
  if (params.state) search.set("state", params.state);
  if (params.menuId) search.set("menu", String(params.menuId));
  if (params.viewId) search.set("view", String(params.viewId));
  if (params.removeId) search.set("remove", String(params.removeId));
  if (params.success) search.set("success", params.success);
  return `/home-management?${search.toString()}`;
}
