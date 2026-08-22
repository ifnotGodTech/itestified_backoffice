import { backendBaseUrl } from "@/core/auth/backend";
import { getAdminShellViewModel } from "./get-admin-shell-view-model";
import type {
  BrandedVideoExportRow,
  MediaExportBranding,
  MediaExportStatus,
  MediaExportViewModel,
} from "@/features/admin/domain/entities/media-exports";

const emptyBranding: MediaExportBranding = {
  id: 1,
  logoUrl: "",
  defaultLogoUrl: "",
  watermarkText: "From iTestified",
  callToAction: "Get the iTestified app for more inspiring testimonies.",
  endCardUrl: "",
  isEnabled: true,
  version: 1,
  updatedBy: null,
  updatedAt: null,
};

function mapBranding(raw: Record<string, unknown>): MediaExportBranding {
  return {
    id: Number(raw.id ?? 1),
    logoUrl: String(raw.logo_url ?? ""),
    defaultLogoUrl: String(raw.default_logo_url ?? ""),
    watermarkText: String(raw.watermark_text ?? emptyBranding.watermarkText),
    callToAction: String(raw.call_to_action ?? emptyBranding.callToAction),
    endCardUrl: String(raw.end_card_url ?? ""),
    isEnabled: Boolean(raw.is_enabled ?? true),
    version: Number(raw.version ?? 1),
    updatedBy: raw.updated_by == null ? null : Number(raw.updated_by),
    updatedAt: raw.updated_at == null ? null : String(raw.updated_at),
  };
}

function mapRow(raw: Record<string, unknown>): BrandedVideoExportRow {
  const status = String(raw.status ?? "pending") as MediaExportStatus;
  return {
    id: Number(raw.id),
    testimonyId: Number(raw.testimony_id),
    testimonyTitle: String(raw.testimony_title ?? "Untitled testimony"),
    brandingVersion: Number(raw.branding_version ?? 1),
    status: ["pending", "processing", "done", "failed"].includes(status) ? status : "pending",
    brandedVideoUrl: String(raw.branded_video_url ?? ""),
    errorMessage: String(raw.error_message ?? ""),
    retryCount: Number(raw.retry_count ?? 0),
    updatedAt: raw.updated_at == null ? null : String(raw.updated_at),
  };
}

export function getMediaExportsViewModel(input: {
  state?: string;
  fullName?: string;
}): MediaExportViewModel {
  const state = input.state === "success" ? "success" : "populated";
  return {
    shell: getAdminShellViewModel({ activeHref: "/media-exports", fullName: input.fullName }),
    branding: emptyBranding,
    rows: [],
    total: 0,
    state,
    successMessage: state === "success" ? "Export branding updated. Future shared videos will use the new version." : undefined,
  };
}

export async function getMediaExportsViewModelFromApi(
  input: { state?: string; fullName?: string },
  cookieHeader: string,
): Promise<MediaExportViewModel> {
  const vm = getMediaExportsViewModel(input);
  try {
    const headers: Record<string, string> = cookieHeader ? { cookie: cookieHeader } : {};
    const [brandingResponse, exportsResponse] = await Promise.all([
      fetch(`${backendBaseUrl}/media-exports/admin/branding/`, { headers, cache: "no-store" }),
      fetch(`${backendBaseUrl}/media-exports/admin/exports/?page_size=50`, { headers, cache: "no-store" }),
    ]);
    if (!brandingResponse.ok || !exportsResponse.ok) {
      return { ...vm, state: "error", errorMessage: "We could not load export branding right now. Please try again." };
    }
    const branding = mapBranding((await brandingResponse.json()) as Record<string, unknown>);
    const exportPayload = (await exportsResponse.json()) as { count?: number; results?: Record<string, unknown>[] };
    return {
      ...vm,
      branding,
      rows: (exportPayload.results ?? []).map(mapRow),
      total: Number(exportPayload.count ?? exportPayload.results?.length ?? 0),
    };
  } catch {
    return { ...vm, state: "error", errorMessage: "We could not load export branding right now. Please try again." };
  }
}
