"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/core/ui/button";
import { AdminAuthFrame } from "@/features/auth/presentation/components/admin-auth-frame";
import { PasswordField } from "@/features/auth/presentation/components/password-field";

const checks = [
  { label: "Password must be at least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  { label: "At least one special character (!@#$%)", test: (value: string) => /[!@#$%]/.test(value) },
] as const;

export default function ResetTemporaryPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rules = [...checks, { label: "Passwords match", test: () => newPassword.length > 0 && newPassword === confirmNewPassword }];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!rules.every((rule) => rule.test(newPassword))) {
      setError("Please satisfy the password rules before continuing.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-temporary-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Unable to change password.");
        setLoading(false);
        return;
      }

      router.push("/overview");
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
      setLoading(false);
    }
  }

  return (
    <AdminAuthFrame title="Change Temporary Password" description="For security, set a new password before continuing.">
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordField label="Current Temporary Password" value={currentPassword} onChange={setCurrentPassword} />
        <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} />
        <PasswordField label="Confirm New Password" value={confirmNewPassword} onChange={setConfirmNewPassword} />

        <ul className="space-y-2 pl-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">
          {rules.map((rule) => (
            <li key={rule.label}>• {rule.label}</li>
          ))}
        </ul>

        {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

        <Button className="w-full rounded-lg py-3.5 text-base" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update Password"}
        </Button>
      </form>
    </AdminAuthFrame>
  );
}
