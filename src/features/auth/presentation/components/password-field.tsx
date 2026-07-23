"use client";

import { useState } from "react";
import { Input } from "@/core/ui/input";
import { cn } from "@/core/lib/cn";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M3 3 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9c5.45 0 8.86 4.37 9.89 6.1a1.76 1.76 0 0 1 0 1.8 14.64 14.64 0 0 1-3.05 3.55" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.72 6.71A14.69 14.69 0 0 0 2.11 11a1.76 1.76 0 0 0 0 1.8c1.03 1.74 4.44 6.1 9.89 6.1 1.9 0 3.56-.52 5-1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M1.9 12.2C2.93 10.46 6.34 6.1 11.79 6.1S20.65 10.46 21.68 12.2a1.76 1.76 0 0 1 0 1.8c-1.03 1.74-4.44 6.1-9.89 6.1S2.93 15.74 1.9 14a1.76 1.76 0 0 1 0-1.8Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="11.79" cy="13.1" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block space-y-2">
      <span className="text-base font-medium text-white">{label}</span>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label}
          className={cn("pr-11", className)}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-secondary)] hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </label>
  );
}
