import type { AdminManagementState, AdminManagementTab } from "@/features/admin/domain/entities/admin-management";

export type AdminManagementRouteParams = {
  state?: AdminManagementState | null;
  tab?: AdminManagementTab | null;
  q?: string | null;
  menu?: number | null;
  permission?: number | null;
  managePermissions?: number | null;
  invite?: boolean | null;
  createRole?: boolean | null;
  assignRole?: number | null;
  manageRole?: number | null;
  renameRole?: number | null;
  remove?: number | null;
  success?: boolean | null;
  successType?: "role-created" | "admin-assigned" | null;
};

export function buildAdminManagementHref(params: AdminManagementRouteParams) {
  const search = new URLSearchParams();
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.tab && params.tab !== "all") search.set("tab", params.tab);
  if (params.q) search.set("q", params.q);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.permission) search.set("permission", String(params.permission));
  if (params.managePermissions) search.set("managePermissions", String(params.managePermissions));
  if (params.invite) search.set("invite", "1");
  if (params.createRole) search.set("createRole", "1");
  if (params.assignRole) search.set("assignRole", String(params.assignRole));
  if (params.manageRole) search.set("manageRole", String(params.manageRole));
  if (params.renameRole) search.set("renameRole", String(params.renameRole));
  if (params.remove) search.set("remove", String(params.remove));
  if (params.success) search.set("success", "1");
  if (params.successType && params.successType !== "role-created") search.set("successType", params.successType);
  const query = search.toString();
  return query ? `/admin?${query}` : "/admin";
}
