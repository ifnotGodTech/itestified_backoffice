import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getTestimoniesViewModelFromBackend } from "@/features/admin/data/services/get-testimonies-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getTestimoniesViewModelFromBackend({
    tab: params.get("tab") ?? undefined,
    videoStatus: params.get("videoStatus") ?? undefined,
    engagement: params.get("engagement") ?? undefined,
    q: params.get("q") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    category: params.get("category") ?? undefined,
    source: params.get("source") ?? undefined,
    statusFilter: params.get("statusFilter") ?? undefined,
    fullName: session?.fullName ?? session?.email,
    cookieHeader,
  });

  return NextResponse.json(viewModel, { status: viewModel.phaseState === "error" ? 502 : 200 });
}
