import { NextResponse } from "next/server";

/** A 303 back to a dashboard page after a form post, with a relative
 * Location. The browser resolves it against the address it's actually on;
 * an absolute URL built from req.url says "localhost" in dev even when the
 * admin opened 127.0.0.1, and the session cookie (scoped to the host)
 * doesn't follow. Only a path on this site is accepted -- a `?next=` value
 * pointing elsewhere falls back to [fallback]. */
export function seeOther(path: string, fallback = "/"): NextResponse {
  const location = path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : fallback;
  return new NextResponse(null, { status: 303, headers: { location } });
}
