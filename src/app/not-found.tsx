import Link from "next/link";
import { Button } from "@/core/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] p-6 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-lg rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-4">
        <h2 className="text-lg font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">The page you requested does not exist.</p>
        <div className="mt-4">
          <Link href="/">
            <Button>Back Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
