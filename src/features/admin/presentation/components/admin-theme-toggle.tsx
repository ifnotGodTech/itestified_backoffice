"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

/**
 * True only after the client has hydrated. Avoids the classic next-themes
 * hydration mismatch (server always renders the default theme; the real
 * theme lives in localStorage, which the server can't see) without
 * setState-in-effect — useSyncExternalStore's server/client snapshot split
 * is the mechanism React itself ships for exactly this case.
 */
function useHasMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function SunIcon({ stroke }: { stroke: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.1" stroke={stroke} strokeWidth="1.5" />
      <path d="M10 2.5v2.1M10 15.4v2.1M17.5 10h-2.1M4.6 10H2.5M15.3 4.7l-1.5 1.5M6.2 13.8l-1.5 1.5M15.3 15.3l-1.5-1.5M6.2 6.2 4.7 4.7" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
      <path d="M12.8 3.4A6.5 6.5 0 1 0 16.6 13 5.7 5.7 0 0 1 12.8 3.4z" fill={fill} />
    </svg>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        active
          ? "border-[var(--color-primary-strong)] bg-[var(--color-primary)]"
          : "border-[var(--color-border-subtle)]/40 bg-[var(--color-surface-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

/** Real dark/light toggle for the admin chrome — backed by next-themes + the `[data-theme]` tokens in globals.css. */
export function AdminThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();

  // Before hydration completes, always render the default ("dark") state so the server
  // and first client render match exactly; the real, possibly-persisted theme takes over
  // the instant hydration finishes.
  const isDark = !hasMounted || resolvedTheme !== "light";
  const activeStroke = "var(--color-text-primary)";
  const inactiveStroke = "var(--color-text-secondary)";

  return (
    <div className="flex items-center gap-[7px]">
      <ToggleButton active={!isDark} onClick={() => setTheme("light")} label="Switch to light mode">
        <SunIcon stroke={!isDark ? activeStroke : inactiveStroke} />
      </ToggleButton>
      <ToggleButton active={isDark} onClick={() => setTheme("dark")} label="Switch to dark mode">
        <MoonIcon fill={isDark ? activeStroke : inactiveStroke} />
      </ToggleButton>
    </div>
  );
}
