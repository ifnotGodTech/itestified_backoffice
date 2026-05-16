import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = {
    title: String(formData.get("title") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    category: String(formData.get("category") ?? ""),
    source: String(formData.get("source") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    publish_at: String(formData.get("publish_at") ?? "") || null,
    expires_at: String(formData.get("expires_at") ?? "") || null,
  };

  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/inspirational-pictures/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const redirect = NextResponse.redirect(
    new URL(
      backendResponse.ok
        ? "/inspirational-pictures?success=upload"
        : "/inspirational-pictures?state=error",
      req.url,
    ),
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
