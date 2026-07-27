import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ pictureId: string }> }) {
  const { pictureId } = await context.params;
  const formData = await req.formData();
  const payload = {
    title: String(formData.get("title") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    category_id: String(formData.get("category_id") ?? "").trim() || null,
    source: String(formData.get("source") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    publish_at: String(formData.get("publish_at") ?? "") || null,
    expires_at: String(formData.get("expires_at") ?? "") || null,
  };

  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/inspirational-pictures/${pictureId}/`, {
    method: "PATCH",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  const redirect = NextResponse.redirect(
    new URL(
      backendResponse.ok
        ? "/inspirational-pictures?success=upload"
        : "/inspirational-pictures?state=error",
      req.url,
    ),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
