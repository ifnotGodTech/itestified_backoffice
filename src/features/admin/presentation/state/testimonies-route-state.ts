import type { VideoTestimonyScreen, VideoTestimonyStatus, WrittenTestimonyStatus, TestimonyState, TestimonyTab } from "@/features/admin/domain/entities/testimonies";

export type TestimoniesRouteParams = {
  tab?: TestimonyTab;
  videoStatus?: VideoTestimonyStatus | null;
  screen?: VideoTestimonyScreen | null;
  state?: TestimonyState | null;
  q?: string;
  from?: string | null;
  to?: string | null;
  category?: string | null;
  source?: string | null;
  categoryMenuOpen?: boolean | null;
  sourceMenuOpen?: boolean | null;
  menu?: number | null;
  view?: number | null;
  reject?: number | null;
  edit?: number | null;
  remove?: number | null;
  filter?: boolean | null;
  settings?: boolean | null;
  statusFilter?: WrittenTestimonyStatus | null;
  success?: string | null;
  origin?: "notification" | null;
};

export function buildTestimoniesHref(params: TestimoniesRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "text") search.set("tab", params.tab);
  if (params.videoStatus && params.videoStatus !== "All") search.set("videoStatus", params.videoStatus);
  if (params.screen && params.screen !== "list") search.set("screen", params.screen);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.category) search.set("category", params.category);
  if (params.source) search.set("source", params.source);
  if (params.categoryMenuOpen) search.set("categoryMenuOpen", "1");
  if (params.sourceMenuOpen) search.set("sourceMenuOpen", "1");
  if (params.menu) search.set("menu", String(params.menu));
  if (params.view) search.set("view", String(params.view));
  if (params.reject) search.set("reject", String(params.reject));
  if (params.edit) search.set("edit", String(params.edit));
  if (params.remove) search.set("remove", String(params.remove));
  if (params.filter) search.set("filter", "1");
  if (params.settings) search.set("settings", "1");
  if (params.statusFilter) search.set("statusFilter", params.statusFilter);
  if (params.success) search.set("success", params.success);
  if (params.origin) search.set("origin", params.origin);
  const query = search.toString();
  return query ? `/testimonies?${query}` : "/testimonies";
}
