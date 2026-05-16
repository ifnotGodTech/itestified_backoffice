import type { ReviewsState } from "@/features/admin/domain/entities/reviews";

export type ReviewsRouteParams = {
  state?: ReviewsState | null;
  q?: string | null;
  filter?: boolean | null;
  rating?: string | null;
  from?: string | null;
  to?: string | null;
  selected?: string | null;
  menu?: number | null;
  view?: number | null;
  remove?: number | null;
  deleteAll?: boolean | null;
};

export function buildReviewsHref(params: ReviewsRouteParams) {
  const search = new URLSearchParams();
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.filter) search.set("filter", "1");
  if (params.rating) search.set("rating", params.rating);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.selected) search.set("selected", params.selected);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.view) search.set("view", String(params.view));
  if (params.remove) search.set("remove", String(params.remove));
  if (params.deleteAll) search.set("deleteAll", "1");
  const query = search.toString();
  return query ? `/reviews?${query}` : "/reviews";
}
