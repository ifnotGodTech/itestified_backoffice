import Image from "next/image";
import type { Metadata } from "next";
import { androidStoreUrl, iosStoreUrl } from "@/features/share/domain/entities/store-links";

// Unlike a testimony share link, this page deliberately never fetches or
// renders the playlist's real contents -- viewing a playlist is
// Premium-gated (Phase 29), so there is nothing safe to show a visitor who
// doesn't have the app. Tapping this link on a device with the app
// installed never reaches this page at all (the Android App Link's
// pathPrefix="/share/" intercepts it first, same as a testimony link); this
// is purely the fallback for someone who doesn't have the app yet.
export const metadata: Metadata = {
  title: "Shared Playlist | iTestified",
  description: "Open this playlist in the iTestified app to view it.",
};

export default function SharedPlaylistPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <Image src="/admin-logo.svg" alt="iTestified" width={140} height={32} className="h-8 w-auto" />

      <div className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Someone shared a playlist with you
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Open it in the iTestified app to view it. Playlists are a Premium feature, so you&apos;ll need to be
          signed in with an active subscription.
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
