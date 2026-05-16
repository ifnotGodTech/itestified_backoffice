import type { AnalyticsArea, AnalyticsState, TestimonyMode } from "@/features/admin/domain/entities/analytics";

export type AnalyticsRouteParams = {
  area?: AnalyticsArea | null;
  mode?: TestimonyMode | null;
  period?: string | null;
  state?: AnalyticsState | null;
};

export function buildAnalyticsHref(params: AnalyticsRouteParams) {
  const search = new URLSearchParams();
  if (params.area && params.area !== "testimonies") search.set("area", params.area);
  if (params.mode && params.mode !== "text") search.set("mode", params.mode);
  if (params.period) search.set("period", params.period);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  const query = search.toString();
  return query ? `/analytics?${query}` : "/analytics";
}
