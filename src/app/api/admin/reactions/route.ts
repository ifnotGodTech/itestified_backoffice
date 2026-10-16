import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";
import type { ReactionsAction } from "@/features/admin/domain/entities/reactions";
import {
  backendRequestFor,
  toReactionsData,
  type ReactionOverviewPayload,
} from "@/features/admin/data/services/get-reactions-view-model";

const ACTIONS = new Set(["create", "edit", "retire", "restore", "set"]);

// Phase 35 Slice 6: every change on the Reactions page comes through here and
// answers with the whole, fresh set of reactions (or the backend's message
// for the admin when a change is refused).
export async function POST(req: Request) {
  const action = (await req.json().catch(() => null)) as ReactionsAction | null;
  if (!action || !ACTIONS.has(action.action)) {
    return NextResponse.json({ message: "That change isn't possible." }, { status: 400 });
  }
  const { path, method, body } = backendRequestFor(action);
  const backendResponse = await fetch(`${backendBaseUrl}${path}`, {
    method,
    headers: buildBackendSessionHeaders(req, true),
    body: body === undefined ? JSON.stringify({}) : JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await backendResponse.json().catch(() => ({}));
  const response = backendResponse.ok
    ? NextResponse.json(toReactionsData(payload as ReactionOverviewPayload))
    : NextResponse.json(
        { message: (payload as { message?: string }).message ?? "We could not save that change. Please try again." },
        { status: backendResponse.status },
      );
  for (const header of extractSetCookieHeaders(backendResponse)) response.headers.append("set-cookie", header);
  return response;
}
