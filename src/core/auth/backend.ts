export const backendBaseUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

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
