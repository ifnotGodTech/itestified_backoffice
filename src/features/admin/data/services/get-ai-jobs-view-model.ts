import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type { AIJobKind, AIJobRow, AIJobStatus, AIJobStatusFilter, AIJobsViewModel } from "@/features/admin/domain/entities/ai-jobs";

function normalizeStatusFilter(status?: string): AIJobStatusFilter {
  if (status === "pending" || status === "processing" || status === "done" || status === "failed") return status;
  return "all";
}

function toDateTimeLabel(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function mapRows(kind: AIJobKind, results: Array<Record<string, unknown>>): AIJobRow[] {
  return results.map((item) => {
    const updatedAt = String(item.updated_at ?? "");
    return {
      id: Number(item.id ?? 0),
      kind,
      testimonyId: Number(item.testimony_id ?? 0),
      testimonyTitle: String(item.testimony_title ?? ""),
      language: kind === "translation" ? String(item.language ?? "") : null,
      status: (String(item.status ?? "pending") as AIJobStatus),
      errorMessage: String(item.error_message ?? ""),
      retryCount: Number(item.retry_count ?? 0),
      updatedAt,
      updatedAtLabel: toDateTimeLabel(updatedAt),
    };
  });
}

function getSuccessMessage(kind?: string) {
  if (kind === "retry") return "Job re-queued for another attempt.";
  return undefined;
}

async function fetchJobs(kind: AIJobKind, statusFilter: AIJobStatusFilter, cookieHeader: string) {
  const searchParams = new URLSearchParams();
  if (statusFilter !== "all") searchParams.set("status", statusFilter);
  searchParams.set("page_size", "100");
  const path = kind === "transcription" ? "transcription-jobs" : "translation-jobs";
  const url = `${backendBaseUrl}/testimonies/admin/${path}/?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json().catch(() => ({}))) as { results?: Array<Record<string, unknown>> };
  return mapRows(kind, payload.results ?? []);
}

export async function getAIJobsViewModelFromApi(
  input: { status?: string; success?: string; fullName?: string },
  cookieHeader: string,
): Promise<AIJobsViewModel> {
  const statusFilter = normalizeStatusFilter(input.status);
  const shell = getAdminShellViewModel({ activeHref: "/ai-jobs", fullName: input.fullName });

  const [transcriptionRows, translationRows] = await Promise.all([
    fetchJobs("transcription", statusFilter, cookieHeader),
    fetchJobs("translation", statusFilter, cookieHeader),
  ]);

  if (transcriptionRows === null || translationRows === null) {
    return {
      shell,
      pageTitle: "AI Jobs",
      pageDescription: "Transcription and translation jobs (Phase 22). Failed jobs never get silently stuck — retry them here.",
      phaseState: "error",
      statusFilter,
      rows: [],
      errorMessage: "We could not load AI jobs right now. Please try again.",
    };
  }

  const rows = [...transcriptionRows, ...translationRows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    shell,
    pageTitle: "AI Jobs",
    pageDescription: "Transcription and translation jobs (Phase 22). Failed jobs never get silently stuck — retry them here.",
    phaseState: rows.length === 0 ? "empty" : "populated",
    statusFilter,
    rows,
    successMessage: getSuccessMessage(input.success),
  };
}
