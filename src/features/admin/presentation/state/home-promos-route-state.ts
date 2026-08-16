import type { HomePromoStatusFilter } from "@/features/admin/domain/entities/home-promos";

export type HomePromosRouteParams = {
  status?: HomePromoStatusFilter | null;
  q?: string | null;
  edit?: number | null;
  success?: string | null;
  page?: number | null;
};

export function buildHomePromosHref(params: HomePromosRouteParams) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.edit) search.set("edit", String(params.edit));
  if (params.success) search.set("success", params.success);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/home-promos?${query}` : "/home-promos";
}
