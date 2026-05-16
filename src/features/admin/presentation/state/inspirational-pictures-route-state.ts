import type { InspirationalPictureScreen, InspirationalPictureState, InspirationalPictureStatus } from "@/features/admin/domain/entities/inspirational-pictures";

export type InspirationalPicturesRouteParams = {
  status?: InspirationalPictureStatus | null;
  screen?: InspirationalPictureScreen | null;
  state?: InspirationalPictureState | null;
  q?: string | null;
  menu?: number | null;
  view?: number | null;
  edit?: number | null;
  remove?: number | null;
  success?: string | null;
};

export function buildInspirationalPicturesHref(params: InspirationalPicturesRouteParams) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.screen && params.screen !== "list") search.set("screen", params.screen);
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.q) search.set("q", params.q);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.view) search.set("view", String(params.view));
  if (params.edit) search.set("edit", String(params.edit));
  if (params.remove) search.set("remove", String(params.remove));
  if (params.success) search.set("success", params.success);
  const query = search.toString();
  return query ? `/inspirational-pictures?${query}` : "/inspirational-pictures";
}
