import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractBackendErrorMessage, extractSetCookieHeaders } from "@/core/auth/backend";

// The delete confirmation's form posts here; back to the list with the outcome.
export async function POST(req: Request, context: { params: Promise<{ scriptureId: string }> }) {
  const { scriptureId } = await context.params;
  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/scriptures/${encodeURIComponent(scriptureId)}/`, {
    method: "DELETE",
    headers: buildBackendSessionHeaders(req, true),
    cache: "no-store",
  });

  const query = new URLSearchParams();
  if (backendResponse.ok) {
    query.set("deleted", "1");
  } else {
    query.set("error", await extractBackendErrorMessage(backendResponse, "Unable to delete this scripture. Please try again."));
  }
  const redirect = seeOther(`/scripture-of-the-day?${query.toString()}`);
  for (const header of extractSetCookieHeaders(backendResponse)) redirect.headers.append("set-cookie", header);
  return redirect;
}
