import Image from "next/image";
import type { Metadata } from "next";
import { androidStoreUrl, iosStoreUrl } from "@/features/share/domain/entities/store-links";

// Generic fallback for content with no dedicated share page of its own --
// Scripture of the day and inspirational pictures share real text/images
// directly (no backend id to build a testimony- or playlist-style page
// around), so their share links point here instead of nowhere. Same
// branded-icon-as-openGraph-image fallback as the playlist/referral share
// pages, for the same reason (no per-share image to use as the preview).
const shareImageUrl = "/apple-icon.png";

export const metadata: Metadata = {
  title: "iTestified",
  description: "Get the iTestified app.",
  openGraph: {
    title: "iTestified",
    description: "Get the iTestified app.",
    images: [{ url: shareImageUrl }],
  },
  twitter: {
    card: "summary",
    title: "iTestified",
    description: "Get the iTestified app.",
    images: [shareImageUrl],
  },
};

export default function ShareAppPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <Image src="/admin-logo.svg" alt="iTestified" width={140} height={32} className="h-8 w-auto" />

      <div className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Someone shared this with you</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Get the iTestified app for daily scripture, real testimonies, and more.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={androidStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-strong)]"
          >
            Get it on Google Play
          </a>
          <a
            href={iosStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]"
          >
            Download on the App Store
          </a>
        </div>
      </div>
    </main>
  );
}
