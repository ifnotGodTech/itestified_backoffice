import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  AppVersionPlatform,
  AppVersionRow,
  AppVersionState,
  AppVersionViewModel,
} from "@/features/admin/domain/entities/app-versions";

function normalizeState(state?: string): AppVersionState {
  if (state === "error" || state === "success" || state === "validation" || state === "notified") return state;
  return "populated";
}

function defaultRows(): AppVersionRow[] {
  return [
    { platform: "android", minimumVersion: "", latestVersion: "", updatedAt: null },
    { platform: "ios", minimumVersion: "", latestVersion: "", updatedAt: null },
  ];
}

export function getAppVersionViewModel(input: {
  state?: string;
  count?: string;
  fullName?: string;
}): AppVersionViewModel {
  const phaseState = normalizeState(input.state);
  const notifiedCount = Number.parseInt(input.count ?? "", 10);
  return {
    shell: getAdminShellViewModel({ activeHref: "/app-version", fullName: input.fullName }),
    pageTitle: "App version",
    pageDescription:
      "Set the minimum and latest app version, per platform. Users below the minimum are blocked from using the app; users below latest (but at or above minimum) just see a dismissible update reminder. Add a build number (e.g. 1.2.0+40) to gate a specific build within the same version — otherwise any build of that version is treated as current.",
    phaseState,
    rows: defaultRows(),
    successMessage: phaseState === "success" ? "Version settings updated successfully." : undefined,
    errorMessage:
      phaseState === "error" ? "Something went wrong loading or saving version settings. Please try again." : undefined,
    validationMessage:
      phaseState === "validation"
        ? "Enter valid versions in the form MAJOR.MINOR.PATCH, e.g. 1.2.0 or 1.2.0+40 — and make sure latest isn't lower than minimum."
        : undefined,
    notifiedMessage:
      phaseState === "notified"
        ? Number.isFinite(notifiedCount) && notifiedCount > 0
          ? `Notified ${notifiedCount} user${notifiedCount === 1 ? "" : "s"} to update.`
          : "No users with a registered device on that platform to notify."
        : undefined,
  };
}

export async function getAppVersionViewModelFromApi(
  input: { state?: string; count?: string; fullName?: string },
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
      latest_version: string;
      updated_at: string | null;
    }>;
    const rows = defaultRows().map((row) => {
      const match = payload.find((item) => item.platform === row.platform);
      return match
        ? {
            platform: row.platform,
            minimumVersion: match.minimum_version,
            latestVersion: match.latest_version,
            updatedAt: match.updated_at,
          }
        : row;
    });
    return {
      ...vm,
      rows,
      phaseState:
        input.state === "success" ||
        input.state === "validation" ||
        input.state === "error" ||
        input.state === "notified"
          ? vm.phaseState
          : "populated",
    };
  } catch {
    return {
      ...vm,
      phaseState: "error",
      errorMessage: "We could not load the current version settings right now. Please try again.",
    };
  }
}
