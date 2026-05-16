import Image from "next/image";
import type { ReactNode } from "react";

export function AdminAuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(153,102,204,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(153,102,204,0.08),transparent_26%),#0a0a0a] px-6 py-10 text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center text-center">
            <Image src="/admin-icon.svg" alt="iTestified" width={64} height={64} priority />
            <h1 className="mt-8 text-[2.05rem] font-semibold tracking-[-0.03em] text-white">{title}</h1>
            {description ? (
              <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
            ) : null}
          </div>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
