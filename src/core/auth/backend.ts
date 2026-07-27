export const backendBaseUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const backendOrigin = new URL(backendBaseUrl).origin;

function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((item) => item.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

export function buildBackendSessionHeaders(req: Request, includeJson: boolean = false): Record<string, string> {
  const cookieHeader = req.headers.get("cookie");
  const csrfToken = readCookieValue(cookieHeader, "csrftoken");
  const headers: Record<string, string> = {};
  if (includeJson) headers["content-type"] = "application/json";
  if (cookieHeader) headers.cookie = cookieHeader;
  if (csrfToken) headers["x-csrftoken"] = csrfToken;
  // Django CSRF checks on secure requests require a Referer/Origin match.
  // Server-to-server proxy calls do not include browser Referer automatically.
  headers.origin = backendOrigin;
  headers.referer = `${backendOrigin}/`;
  return headers;
}

export async function postBackendAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { response, data };
}

export function extractSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

// DRF validation errors come back as { "<field>": ["message", ...] } or
// { "non_field_errors": ["message"] }. Surface the first message found so
// forms can show the admin what actually went wrong instead of a generic
// "something failed" state.
export async function extractBackendErrorMessage(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }
  return fallback;
}
