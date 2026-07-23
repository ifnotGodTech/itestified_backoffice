import { backendBaseUrl } from "@/core/auth/backend";
import {
  getTestimoniesViewModel,
  normalizeVideoEngagement,
  normalizeVideoSource,
  sortVideoRowsByEngagement,
} from "@/features/admin/data/services/get-testimonies-view-model.fixtures";
import { formatShowingLabel, parsePageParam } from "@/features/admin/data/services/pagination";
import type {
  TestimonyCategoryOption,
  TestimoniesViewModel,
  TestimonyRow,
  TextTestimonyRow,
  VideoTestimonyRow,
  VideoTestimonyStatus,
  WrittenTestimonyStatus,
} from "@/features/admin/domain/entities/testimonies";

export { getTestimoniesViewModel } from "@/features/admin/data/services/get-testimonies-view-model.fixtures";

type BackendTestimony = {
  id: number;
  title: string;
  testimony_type: "written" | "video";
  status: "draft" | "pending_review" | "approved" | "rejected" | "scheduled" | "archived";
  author_name: string;
  author_email: string;
  category: string;
  category_slug?: string;
  view_count: number;
  comment_count: number;
  created_at: string;
  publish_at?: string | null;
  archived_at?: string | null;
  source?: string;
  moderation_history?: Array<{
    id: number;
    action: "approved" | "rejected" | "scheduled" | "archived" | "auto_published";
    from_status: string;
    to_status: string;
    reason: string;
    publish_at?: string | null;
    created_at: string;
    actor_email?: string | null;
    actor_name?: string | null;
  }>;
  body?: string;
  video_url?: string;
  thumbnail_url?: string;
};

type BackendCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
};

type CachedCategories = {
  expiresAt: number;
  categories: TestimonyCategoryOption[];
};

const CATEGORY_CACHE_TTL_MS = 60_000;
const TESTIMONIES_PAGE_SIZE = 20;
const categoryCache = new Map<string, CachedCategories>();

function normalizeBackendCategoriesPayload(payload: unknown): BackendCategory[] {
  if (Array.isArray(payload)) return payload as BackendCategory[];
  if (payload && typeof payload === "object") {
    const maybeMap = payload as { results?: unknown };
    if (Array.isArray(maybeMap.results)) return maybeMap.results as BackendCategory[];
  }
  return [];
}

function mapBackendStatusToText(status: BackendTestimony["status"]): WrittenTestimonyStatus {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "scheduled") return "Scheduled";
  if (status === "archived") return "Archived";
  return "Pending";
}

function mapBackendStatusToVideo(status: BackendTestimony["status"]): Exclude<VideoTestimonyStatus, "All"> {
  if (status === "approved") return "Uploaded";
  if (status === "draft") return "Drafts";
  if (status === "rejected") return "Drafts";
  if (status === "scheduled") return "Scheduled";
  if (status === "archived") return "Archived";
  return "Drafts";
}

function extractVideoSource(body: string | undefined): string {
  const sourceLine = (body ?? "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith("source:"));
  const source = sourceLine?.slice("source:".length).trim();
  return source ? normalizeVideoSource(source) : "Uploaded";
}

export async function getTestimoniesViewModelFromBackend(
  input: Parameters<typeof getTestimoniesViewModel>[0] & { cookieHeader?: string },
): Promise<TestimoniesViewModel> {
  const base = getTestimoniesViewModel(input);
  const page = parsePageParam(input.page);
  const activeTab = input.tab === "video" ? "video" : "text";
  const statusFilter =
    activeTab === "text"
      ? input.statusFilter === "Approved"
        ? "approved"
        : input.statusFilter === "Rejected"
          ? "rejected"
          : input.statusFilter === "Pending"
            ? "pending_review"
            : input.statusFilter === "Scheduled"
              ? "scheduled"
              : input.statusFilter === "Archived"
                ? "archived"
            : ""
      : input.videoStatus === "Uploaded"
        ? "approved"
      : input.videoStatus === "Drafts"
          ? "draft"
        : input.videoStatus === "Scheduled"
            ? "scheduled"
          : input.videoStatus === "Archived"
            ? "archived"
            : "";
  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  if (input.q?.trim()) params.set("search", input.q.trim());
  if (input.category?.trim()) params.set("category", input.category.trim());
  if (input.from?.trim()) params.set("date_from", input.from.trim());
  if (input.to?.trim()) params.set("date_to", input.to.trim());
  if (activeTab === "video" && input.source?.trim()) params.set("source", input.source.trim());
  params.set("testimony_type", activeTab === "video" ? "video" : "written");
  params.set("page_size", String(TESTIMONIES_PAGE_SIZE));
  params.set("page", String(page));
  const categoryCacheKey = input.cookieHeader ?? "anonymous";
  const cachedCategories = categoryCache.get(categoryCacheKey);
  const shouldFetchCategories = !cachedCategories || cachedCategories.expiresAt <= Date.now();

  try {
    const testimoniesResponsePromise = fetch(`${backendBaseUrl}/testimonies/admin/testimonies/?${params.toString()}`, {
        headers: input.cookieHeader ? { cookie: input.cookieHeader } : {},
        cache: "no-store",
    });
    const categoriesResponsePromise = shouldFetchCategories
      ? fetch(`${backendBaseUrl}/testimonies/admin/categories/`, {
          headers: input.cookieHeader ? { cookie: input.cookieHeader } : {},
          cache: "no-store",
        })
      : Promise.resolve(null);
    const [testimoniesResponse, categoriesResponse] = await Promise.all([
      testimoniesResponsePromise,
      categoriesResponsePromise,
    ]);
    if (!testimoniesResponse.ok || (categoriesResponse && !categoriesResponse.ok)) {
      return {
        ...base,
        phaseState: "error",
        rows: [],
        totalRows: 0,
        showingLabel: "Showing 0 of 0",
        page,
        hasNextPage: false,
        hasPreviousPage: page > 1,
        // The list failed to load, so there is no real row behind any id in the URL —
        // never leak the mock fixture's selectedRow/open-modal state into an error response.
        selectedRow: null,
        showActionMenu: false,
        showDetails: false,
        showRejectModal: false,
        showScheduleModal: false,
        showArchiveModal: false,
        showEditModal: false,
        showDeleteModal: false,
      };
    }
    const testimoniesPayload = (await testimoniesResponse.json()) as {
      count?: number;
      results?: BackendTestimony[];
      next?: string | null;
      previous?: string | null;
    };
    const categories =
      cachedCategories && !shouldFetchCategories
        ? cachedCategories.categories
        : normalizeBackendCategoriesPayload((await categoriesResponse?.json()) as unknown).map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            isActive: category.is_active,
          }));
    const backendRows = testimoniesPayload.results ?? [];
    if (shouldFetchCategories) {
      categoryCache.set(categoryCacheKey, {
        expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS,
        categories,
      });
    }
    const typedRows: TestimonyRow[] = backendRows
      .filter((item) => (activeTab === "video" ? item.testimony_type === "video" : item.testimony_type === "written"))
      .map((item) => {
        if (item.testimony_type === "video") {
          return {
            kind: "video",
            id: item.id,
            title: item.title,
            category: item.category,
            source: normalizeVideoSource(item.source ?? "") || extractVideoSource(item.body),
            videoUrl: item.video_url || "",
            dateUploaded: new Date(item.created_at).toLocaleDateString("en-GB"),
            uploadedBy: item.author_name,
            views: item.view_count,
            likes: null,
            comments: item.comment_count,
            shares: null,
            status: mapBackendStatusToVideo(item.status),
            thumbnailSrc: item.thumbnail_url || "/admin-logo.svg",
          } satisfies VideoTestimonyRow;
        }
        return {
          kind: "text",
          id: item.id,
          title: item.title,
          testimonyId: `TEXT-${String(item.id).padStart(3, "0")}`,
          name: item.author_name,
          email: item.author_email,
          category: item.category,
          dateSubmitted: new Date(item.created_at).toLocaleDateString("en-GB"),
          likes: 0,
          comments: item.comment_count,
          shares: 0,
          status: mapBackendStatusToText(item.status),
          avatarSrc: "/admin-logo.svg",
          body: item.body || "",
        } satisfies TextTestimonyRow;
      });

    const activeVideoEngagement = normalizeVideoEngagement(input.engagement);
    const finalRows: TestimonyRow[] =
      activeTab === "video"
        ? sortVideoRowsByEngagement(
            typedRows.filter((row): row is VideoTestimonyRow => row.kind === "video"),
            activeVideoEngagement,
          )
        : typedRows;

    const selectedId = Number(input.menu ?? input.view ?? input.reject ?? input.schedule ?? input.archive ?? input.edit ?? input.remove ?? "");
    let selectedRow = Number.isFinite(selectedId) ? finalRows.find((row) => row.id === selectedId) ?? null : null;
    if (selectedRow && input.view) {
      const detailResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/${selectedRow.id}/`, {
        headers: input.cookieHeader ? { cookie: input.cookieHeader } : {},
        cache: "no-store",
      });
      if (detailResponse.ok) {
        const detailPayload = (await detailResponse.json()) as BackendTestimony;
        const moderationHistory = detailPayload.moderation_history ?? [];
        selectedRow =
          selectedRow.kind === "text"
            ? {
                ...selectedRow,
                body: detailPayload.body || selectedRow.body,
                moderationHistory,
              }
            : {
                ...selectedRow,
                videoUrl: detailPayload.video_url || selectedRow.videoUrl || "",
                moderationHistory,
              };
      }
    }
    const total = testimoniesPayload.count ?? finalRows.length;
    return {
      ...base,
      phaseState: "populated",
      categories,
      rows: finalRows,
      selectedRow,
      totalRows: total,
      showingLabel: formatShowingLabel(page, finalRows.length, total),
      page,
      hasNextPage: Boolean(testimoniesPayload.next),
      hasPreviousPage: Boolean(testimoniesPayload.previous) || page > 1,
    };
  } catch {
    return {
      ...base,
      phaseState: "error",
      rows: [],
      totalRows: 0,
      showingLabel: "Showing 0 of 0",
      page,
      hasNextPage: false,
      hasPreviousPage: page > 1,
      selectedRow: null,
      showActionMenu: false,
      showDetails: false,
      showRejectModal: false,
      showScheduleModal: false,
      showArchiveModal: false,
      showEditModal: false,
      showDeleteModal: false,
    };
  }
}
