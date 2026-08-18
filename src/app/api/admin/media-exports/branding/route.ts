import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = {
    logo_url: String(formData.get("logo_url") ?? "").trim(),
    watermark_text: String(formData.get("watermark_text") ?? "").trim(),
    call_to_action: String(formData.get("call_to_action") ?? "").trim(),
    end_card_url: String(formData.get("end_card_url") ?? "").trim(),
    is_enabled: formData.get("is_enabled") === "on",
  };
  const backendResponse = await fetch(`${backendBaseUrl}/media-exports/admin/branding/`, {
    method: "PUT",
    headers: { ...buildBackendSessionHeaders(req, true), "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const response = NextResponse.redirect(
    new URL(`/media-exports?state=${backendResponse.ok ? "success" : "error"}`, req.url),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) response.headers.append("set-cookie", header);
  return response;
}
