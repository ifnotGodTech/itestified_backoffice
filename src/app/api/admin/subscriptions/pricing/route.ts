import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;

export async function POST(req: Request) {
  const formData = await req.formData();
  const currency = ((formData.get("currency") as string | null) ?? "").trim().toUpperCase();
  const rawAmount = ((formData.get("amount") as string | null) ?? "").trim();
  const amountMajor = Number.parseFloat(rawAmount);

  // status 303 forces the browser to follow up with GET; the default 307
  // preserves POST, which Next.js's App Router then rejects as an invalid
  // server-action request (same as app-version's own redirect below).
  if (!CURRENCY_PATTERN.test(currency) || !Number.isFinite(amountMajor) || amountMajor <= 0) {
    return NextResponse.redirect(new URL("/subscriptions/pricing?state=validation", req.url), 303);
  }

  // The backend stores minor units (kobo/cents); the admin types a normal
  // major-unit price (e.g. "3000" or "4.99"), matching how amounts are
  // already displayed everywhere else in this dashboard.
  const amountMinor = Math.round(amountMajor * 100);

  const backendResponse = await fetch(`${backendBaseUrl}/subscriptions/admin/pricing/set/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ currency, amount: amountMinor }),
    cache: "no-store",
  });

  const targetState =
    backendResponse.status === 400
      ? "validation"
      : backendResponse.status === 502
        ? "gateway_error"
        : backendResponse.ok
          ? "success"
          : "error";

  const redirect = NextResponse.redirect(new URL(`/subscriptions/pricing?state=${targetState}`, req.url), 303);
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
