import Image from "next/image";
import type { ShareTestimony } from "@/features/share/domain/entities/share-testimony";
import { androidStoreUrl, iosStoreUrl } from "@/features/share/domain/entities/store-links";

export function ShareTestimonyPage({ testimony }: { testimony: ShareTestimony }) {
  const excerpt = testimony.pullQuote || truncate(testimony.body, 320);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-10">
      <Image src="/admin-logo.svg" alt="iTestified" width={140} height={32} className="h-8 w-auto" priority />

      <div className="overflow-hidden rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-[0_24px_80px_-56px_rgba(0,0,0,0.8)]">
        {testimony.thumbnailUrl ? (
          <div className="relative aspect-[16/9] w-full bg-[var(--color-surface-muted)]">
            <Image
              src={testimony.thumbnailUrl}
              alt={testimony.title}
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 p-6">
          <span className="w-fit rounded-full bg-[var(--color-primary)]/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
            {testimony.category}
          </span>

          <h1 className="text-balance text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">
            {testimony.title}
          </h1>

          {excerpt ? (
            <p className="text-pretty text-sm leading-7 text-[var(--color-text-secondary)]">{excerpt}</p>
          ) : null}

          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            Shared via iTestified
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {testimony.testimonyType === "video"
            ? "Watch the full testimony in the app"
            : "Read the full testimony in the app"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Get the free iTestified app to see the full story, react, and discover more testimonies like this one.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={androidStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_40px_-24px_rgba(153,102,204,0.9)] transition duration-200 hover:bg-[var(--color-primary-strong)]"
          >
            Get it on Google Play
          </a>
          <a
            href={iosStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition duration-200 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]"
          >
            Download on the App Store
          </a>
        </div>
      </div>
    </main>
  );
}

export function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}
