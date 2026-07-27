import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  AppVersionPlatform,
  AppVersionRow,
  AppVersionState,
  AppVersionViewModel,
} from "@/features/admin/domain/entities/app-versions";

function normalizeState(state?: string): AppVersionState {
  if (state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

function defaultRows(): AppVersionRow[] {
  return [
    { platform: "android", minimumVersion: "", updatedAt: null },
    { platform: "ios", minimumVersion: "", updatedAt: null },
  ];
}

export function getAppVersionViewModel(input: { state?: string; fullName?: string }): AppVersionViewModel {
  const phaseState = normalizeState(input.state);
  return {
    shell: getAdminShellViewModel({ activeHref: "/app-version", fullName: input.fullName }),
    pageTitle: "App version",
    pageDescription:
      "Set the minimum app version required to use iTestified. Users on an older version are blocked from using the app until they update.",
    phaseState,
    rows: defaultRows(),
    successMessage: phaseState === "success" ? "Minimum version updated successfully." : undefined,
    errorMessage:
      phaseState === "error" ? "We could not load the current version settings right now. Please try again." : undefined,
    validationMessage:
      phaseState === "validation" ? "Enter a valid version in the form MAJOR.MINOR.PATCH, e.g. 1.2.0." : undefined,
  };
}

export async function getAppVersionViewModelFromApi(
  input: { state?: string; fullName?: string },
  cookieHeader: string,
): Promise<AppVersionViewModel> {
  const vm = getAppVersionViewModel(input);
  try {
    const response = await fetch(`${backendBaseUrl}/app-versions/admin/requirements/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ...vm,
        phaseState: "error",
        errorMessage: "We could not load the current version settings right now. Please try again.",
      };
    }
    const payload = (await response.json().catch(() => [])) as Array<{
      platform: AppVersionPlatform;
      minimum_version: string;
      updated_at: string | null;
    }>;
    const rows = defaultRows().map((row) => {
      const match = payload.find((item) => item.platform === row.platform);
      return match ? { platform: row.platform, minimumVersion: match.minimum_version, updatedAt: match.updated_at } : row;
    });
    return {
      ...vm,
      rows,
      phaseState: input.state === "success" || input.state === "validation" ? vm.phaseState : "populated",
    };
  } catch {
    return {
      ...vm,
      phaseState: "error",
      errorMessage: "We could not load the current version settings right now. Please try again.",
    };
  }
}
