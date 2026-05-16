import type { UserManagementState, UserManagementTab } from "@/features/admin/domain/entities/users";

export type UsersRouteParams = {
  tab?: UserManagementTab;
  state?: UserManagementState | null;
  q?: string;
  menu?: number | null;
  view?: number | null;
  deactivate?: number | null;
  reactivate?: number | null;
  success?: string | null;
};

export function buildUsersHref(params: UsersRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "registered") search.set("tab", params.tab);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.view) search.set("view", String(params.view));
  if (params.deactivate) search.set("deactivate", String(params.deactivate));
  if (params.reactivate) search.set("reactivate", String(params.reactivate));
  if (params.success) search.set("success", params.success);
  const query = search.toString();
  return query ? `/users?${query}` : "/users";
}
