import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  MediaUploadPolicySection,
  MediaUploadPolicyState,
  MediaUploadPolicyViewModel,
  UploadPolicyForm,
} from "@/features/admin/domain/entities/media-upload-policy";

function normalizeState(state?: string): MediaUploadPolicyState {
  if (state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

function normalizeSection(section?: string): MediaUploadPolicySection | null {
  if (section === "video" || section === "audio") return section;
  return null;
}

function defaultVideoPolicy(): UploadPolicyForm {
  return {
    maxFileSizeMb: 200,
    maxDurationMinutes: 5,
    allowedContentTypes: ["video/mp4", "video/quicktime"],
    dailyLimit: 3,
    updatedByName: "",
    updatedAt: null,
  };
}

function defaultAudioPolicy(): UploadPolicyForm {
  return {
    maxFileSizeMb: 50,
    maxDurationMinutes: 15,
    allowedContentTypes: ["audio/aac", "audio/mp4", "audio/x-m4a", "audio/mpeg", "audio/mp3"],
    dailyLimit: 5,
    updatedByName: "",
    updatedAt: null,
  };
}

function messagesFor(phaseState: MediaUploadPolicyState, section: MediaUploadPolicySection | null) {
  if (phaseState === "success") {
    return { successMessage: section === "audio" ? "Audio upload policy updated." : "Video upload policy updated." };
  }
  if (phaseState === "validation") {
    return { validationMessage: "Check the values you entered and try again." };
  }
  if (phaseState === "error") {
    return { errorMessage: "Something went wrong. Please try again." };
  }
  return {};
}

function toForm(payload: Record<string, unknown>, fallback: UploadPolicyForm): UploadPolicyForm {
  const contentTypes = Array.isArray(payload.allowed_content_types)
    ? (payload.allowed_content_types as unknown[]).filter((item): item is string => typeof item === "string")
    : fallback.allowedContentTypes;
  return {
    maxFileSizeMb: Number(payload.max_file_size_bytes ?? fallback.maxFileSizeMb * 1024 * 1024) / (1024 * 1024),
    maxDurationMinutes: Number(payload.max_duration_ms ?? fallback.maxDurationMinutes * 60000) / 60000,
    allowedContentTypes: contentTypes,
    dailyLimit: Number(payload.daily_limit ?? fallback.dailyLimit),
    updatedByName: String(payload.updated_by_name ?? payload.updated_by_email ?? ""),
    updatedAt: (payload.updated_at as string) ?? null,
  };
}

export async function getMediaUploadPolicyViewModelFromApi(
  input: { state?: string; section?: string; fullName?: string },
  cookieHeader: string,
): Promise<MediaUploadPolicyViewModel> {
  const phaseState = normalizeState(input.state);
  const bannerSection = normalizeSection(input.section);
  const base: MediaUploadPolicyViewModel = {
    shell: getAdminShellViewModel({ activeHref: "/testimonies", activeChildHref: "/testimonies/upload-policy", fullName: input.fullName }),
    pageTitle: "Testimony Upload Policy",
    pageDescription:
      "Configure the size, length, format, and daily-submission caps a Premium user's self-service video or audio testimony must fit. Changes apply immediately to future uploads, with no deploy needed.",
    phaseState,
    bannerSection,
    video: defaultVideoPolicy(),
    audio: defaultAudioPolicy(),
    ...messagesFor(phaseState, bannerSection),
  };

  const headers: Record<string, string> = cookieHeader ? { cookie: cookieHeader } : {};
  try {
    const [videoRes, audioRes] = await Promise.all([
      fetch(`${backendBaseUrl}/testimonies/admin/video-upload-policy/`, { headers, cache: "no-store" }),
      fetch(`${backendBaseUrl}/testimonies/admin/audio-upload-policy/`, { headers, cache: "no-store" }),
    ]);

    if (!videoRes.ok || !audioRes.ok) {
      return { ...base, phaseState: "error", errorMessage: "We could not load this page right now. Please try again." };
    }

    const videoPayload = (await videoRes.json()) as Record<string, unknown>;
    const audioPayload = (await audioRes.json()) as Record<string, unknown>;

    return {
      ...base,
      video: toForm(videoPayload, base.video),
      audio: toForm(audioPayload, base.audio),
    };
  } catch {
    return { ...base, phaseState: "error", errorMessage: "We could not load this page right now. Please try again." };
  }
}
