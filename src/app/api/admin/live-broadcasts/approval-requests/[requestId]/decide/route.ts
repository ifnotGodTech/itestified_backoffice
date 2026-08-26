import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await context.params;
  const formData = await req.formData();
  const approve = formData.get("approve") === "true";
  const note = ((formData.get("note") as string | null) ?? "").trim();

  const backendResponse = await fetch(
    `${backendBaseUrl}/live-broadcasts/admin/approval-requests/${requestId}/decide/`,
    {
      method: "POST",
      headers: buildBackendSessionHeaders(req, true),
      body: JSON.stringify({ approve, note }),
      cache: "no-store",
    },
  );

  const targetState = backendResponse.status === 400 ? "validation" : backendResponse.ok ? "success" : "error";
  const redirect = NextResponse.redirect(
    new URL(`/live-broadcasts/policy?section=approval&state=${targetState}`, req.url),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
