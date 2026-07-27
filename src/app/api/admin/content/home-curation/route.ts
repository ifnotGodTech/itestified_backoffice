import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";
import { getHomeManagementViewModelFromApi } from "@/features/admin/data/services/get-home-management-view-model";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    sectionOrder?: string[];
    featuredTestimonyIds?: number[];
    tab?: string;
    rule?: string;
    count?: string;
  };

  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/home-curation/`, {
    method: "PUT",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({
      section_order: body.sectionOrder ?? [],
      featured_testimony_ids: body.featuredTestimonyIds ?? [],
    }),
    cache: "no-store",
  });

  if (!backendResponse.ok) {
    const data = await backendResponse.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: backendResponse.status });
    for (const header of extractSetCookieHeaders(backendResponse)) {
      response.headers.append("set-cookie", header);
    }
    return response;
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const viewModel = await getHomeManagementViewModelFromApi(
    { tab: body.tab, rule: body.rule, count: body.count },
    cookieHeader,
  );
  const response = NextResponse.json(viewModel, { status: 200 });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
