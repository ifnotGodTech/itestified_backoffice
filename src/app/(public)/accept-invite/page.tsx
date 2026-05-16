"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { AdminAuthFrame } from "@/features/auth/presentation/components/admin-auth-frame";
import { PasswordField } from "@/features/auth/presentation/components/password-field";

const checks = [
  { label: "Password must be at least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  { label: "At least one special character (!@#$%)", test: (value: string) => /[!@#$%]/.test(value) },
] as const;

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rules = [...checks, { label: "Passwords match", test: () => password.length > 0 && password === confirmPassword }];

  async function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/invite/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Unable to verify invitation.");
        setLoading(false);
        return;
      }

      setVerified(true);
      setLoading(false);
    } catch {
      setError("Unable to reach the server.");
      setLoading(false);
    }
  }

  async function onComplete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!rules.every((rule) => rule.test(password))) {
      setError("Please satisfy the password rules before continuing.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/invite/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Unable to complete invitation.");
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
    <AdminAuthFrame title="Accept Admin Invitation" description="Verify your invite code and set your password.">
      {!verified ? (
        <form onSubmit={onVerify} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-base font-medium text-white">Email Address</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block space-y-2">
            <span className="text-base font-medium text-white">Invitation Code</span>
            <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </label>
          {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Invitation"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onComplete} className="space-y-4">
          <PasswordField label="New Password" value={password} onChange={setPassword} />
          <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
          <ul className="space-y-2 pl-2 text-[13px] leading-6 text-[#d6d6d6]">
            {rules.map((rule) => (
              <li key={rule.label}>• {rule.label}</li>
            ))}
          </ul>
          {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Completing..." : "Complete Invitation"}
          </Button>
        </form>
      )}
    </AdminAuthFrame>
  );
}
