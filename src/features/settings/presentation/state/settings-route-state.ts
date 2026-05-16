import type { MyProfileScreen, SettingsState } from "@/features/settings/domain/entities/settings";

export function buildMyProfileHref(params: {
  screen?: MyProfileScreen | null;
  menu?: boolean | null;
  password?: boolean | null;
  state?: SettingsState | null;
}) {
  const search = new URLSearchParams();
  if (params.screen && params.screen !== "profile") search.set("screen", params.screen);
  if (params.menu) search.set("menu", "1");
  if (params.password) search.set("password", "1");
  if (params.state && params.state !== "populated") search.set("state", params.state);
  const query = search.toString();
  return query ? `/my-profile?${query}` : "/my-profile";
}

export function buildNotificationSettingsHref(params: {
  state?: SettingsState | null;
  success?: boolean | null;
}) {
  const search = new URLSearchParams();
  if (params.state && params.state !== "populated") search.set("state", params.state);
  if (params.success) search.set("success", "1");
  const query = search.toString();
  return query ? `/notification-settings?${query}` : "/notification-settings";
}
