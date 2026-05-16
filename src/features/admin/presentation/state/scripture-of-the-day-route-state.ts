import type { ScriptureStatus, ScriptureTab } from "@/features/admin/domain/entities/scripture-of-the-day";

export type ScriptureRouteParams = {
  tab?: ScriptureTab;
  q?: string;
  filter?: boolean;
  count?: number | null;
  from?: string;
  to?: string;
  statusFilter?: "" | ScriptureStatus;
  menu?: number | null;
  view?: number | null;
  edit?: string | null;
  remove?: number | null;
  saved?: boolean;
  deleted?: boolean;
  scripture?: string;
  prayer?: string;
  bibleText?: string;
  bibleVersion?: string;
};

export function buildScriptureOfTheDayHref(params: ScriptureRouteParams) {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "all") search.set("tab", params.tab);
  if (params.q) search.set("q", params.q);
  if (params.filter) search.set("filter", "1");
  if (params.count) search.set("count", String(params.count));
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.statusFilter) search.set("status", params.statusFilter);
  if (params.menu) search.set("menu", String(params.menu));
  if (params.view) search.set("view", String(params.view));
  if (params.edit) search.set("edit", params.edit);
  if (params.remove) search.set("remove", String(params.remove));
  if (params.saved) search.set("saved", "1");
  if (params.deleted) search.set("deleted", "1");
  if (params.scripture) search.set("scripture", params.scripture);
  if (params.prayer) search.set("prayer", params.prayer);
  if (params.bibleText) search.set("bibleText", params.bibleText);
  if (params.bibleVersion) search.set("bibleVersion", params.bibleVersion);
  const query = search.toString();
  return query ? `/scripture-of-the-day?${query}` : "/scripture-of-the-day";
}
