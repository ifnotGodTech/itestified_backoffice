import type { CreatorMinistryTab, CreatorsMinistriesState } from "@/features/admin/domain/entities/creators-ministries";

export type CreatorsMinistriesRouteParams = {
  tab?: CreatorMinistryTab | null;
  state?: CreatorsMinistriesState | null;
  q?: string | null;
  menu?: number | null;
  detail?: number | null;
  verify?: number | null;
  unverify?: number | null;
  success?: string | null;
  page?: number | null;
};

export function buildCreatorsMinistriesHref(params: CreatorsMinistriesRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "queue") search.set("tab", params.tab);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.detail) search.set("detail", String(params.detail));
  if (params.verify) search.set("verify", String(params.verify));
  if (params.unverify) search.set("unverify", String(params.unverify));
  if (params.success) search.set("success", params.success);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/creators-ministries?${query}` : "/creators-ministries";
}
