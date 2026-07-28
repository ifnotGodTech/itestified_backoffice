import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  ProfileContentKey,
  ProfileContentRow,
  ProfileContentState,
  ProfileContentViewModel,
} from "@/features/admin/domain/entities/profile-content";

export const PROFILE_CONTENT_KEYS: ProfileContentKey[] = [
  "about_us",
  "terms_of_use",
  "privacy_policy",
  "support_email",
  "support_phone",
];

function normalizeState(state?: string): ProfileContentState {
  if (state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

function defaultRows(): ProfileContentRow[] {
  return PROFILE_CONTENT_KEYS.map((key) => ({ key, body: "", updatedAt: null }));
}

export function getProfileContentViewModel(input: { state?: string; fullName?: string }): ProfileContentViewModel {
  const state = normalizeState(input.state);
  return {
    shell: getAdminShellViewModel({ activeHref: "/profile-content", fullName: input.fullName }),
    pageTitle: "About & policies",
    pageDescription:
      "Edit the About Us, Terms of Use, and Privacy Policy copy and the Help screen's support contact info shown in the app. Changes apply immediately -- no app release needed.",
    state,
    rows: defaultRows(),
    successMessage: state === "success" ? "Content updated successfully." : undefined,
    errorMessage: state === "error" ? "Something went wrong loading or saving this content. Please try again." : undefined,
    validationMessage: state === "validation" ? "Something went wrong saving one of these fields. Please try again." : undefined,
  };
}

export async function getProfileContentViewModelFromApi(
  input: { state?: string; fullName?: string },
  cookieHeader: string,
): Promise<ProfileContentViewModel> {
  const vm = getProfileContentViewModel(input);
  try {
    const response = await fetch(`${backendBaseUrl}/profile-content/admin/blocks/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...vm, state: "error", errorMessage: "We could not load the current content right now. Please try again." };
    }
    const payload = (await response.json().catch(() => [])) as Array<{
      key: ProfileContentKey;
      body: string;
      updated_at: string | null;
    }>;
    const rows = defaultRows().map((row) => {
      const match = payload.find((item) => item.key === row.key);
      return match ? { key: row.key, body: match.body, updatedAt: match.updated_at } : row;
    });
    return {
      ...vm,
      rows,
      state: input.state === "success" || input.state === "validation" || input.state === "error" ? vm.state : "populated",
    };
  } catch {
    return { ...vm, state: "error", errorMessage: "We could not load the current content right now. Please try again." };
  }
}
