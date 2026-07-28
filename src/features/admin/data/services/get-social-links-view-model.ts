import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  SocialLinkPlatform,
  SocialLinkRow,
  SocialLinkState,
  SocialLinkViewModel,
} from "@/features/admin/domain/entities/social-links";

export const SOCIAL_LINK_PLATFORMS: SocialLinkPlatform[] = [
  "instagram",
  "facebook",
  "x",
  "tiktok",
  "youtube",
  "whatsapp",
];

function normalizeState(state?: string): SocialLinkState {
  if (state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

function defaultRows(): SocialLinkRow[] {
  return SOCIAL_LINK_PLATFORMS.map((platform) => ({ platform, url: "", isActive: false, updatedAt: null }));
}

export function getSocialLinksViewModel(input: { state?: string; fullName?: string }): SocialLinkViewModel {
  const state = normalizeState(input.state);
  return {
    shell: getAdminShellViewModel({ activeHref: "/social-links", fullName: input.fullName }),
    pageTitle: "Follow links",
    pageDescription:
      "Set the social links shown on the “Follow @iTestified” screen in the app. Only platforms that are turned on with a real URL appear to users.",
    state,
    rows: defaultRows(),
    successMessage: state === "success" ? "Follow links updated successfully." : undefined,
    errorMessage: state === "error" ? "Something went wrong loading or saving follow links. Please try again." : undefined,
    validationMessage: state === "validation" ? "Enter a valid URL for each link you turn on." : undefined,
  };
}

export async function getSocialLinksViewModelFromApi(
  input: { state?: string; fullName?: string },
  cookieHeader: string,
): Promise<SocialLinkViewModel> {
  const vm = getSocialLinksViewModel(input);
  try {
    const response = await fetch(`${backendBaseUrl}/social-links/admin/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...vm, state: "error", errorMessage: "We could not load the current follow links right now. Please try again." };
    }
    const payload = (await response.json().catch(() => [])) as Array<{
      platform: SocialLinkPlatform;
      url: string;
      is_active: boolean;
      updated_at: string | null;
    }>;
    const rows = defaultRows().map((row) => {
      const match = payload.find((item) => item.platform === row.platform);
      return match ? { platform: row.platform, url: match.url, isActive: match.is_active, updatedAt: match.updated_at } : row;
    });
    return {
      ...vm,
      rows,
      state: input.state === "success" || input.state === "validation" || input.state === "error" ? vm.state : "populated",
    };
  } catch {
    return { ...vm, state: "error", errorMessage: "We could not load the current follow links right now. Please try again." };
  }
}
