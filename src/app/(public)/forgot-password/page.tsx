"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@itestified.app");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "complete">("request");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const rules = [...checks, { label: "Passwords match", test: () => password.length > 0 && password === confirmPassword }];

  async function onRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Unable to process request.");
        setLoading(false);
        return;
      }

      setMessage(data.message ?? "Reset instructions sent.");
      setStep("verify");
      setLoading(false);
    } catch {
      setError("Unable to reach the server.");
      setLoading(false);
    }
  }

  async function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Unable to verify reset code.");
        setLoading(false);
        return;
      }

      setMessage(data.message ?? "Reset code verified.");
      setStep("complete");
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
      const response = await fetch("/api/auth/forgot-password/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Unable to complete reset.");
        setLoading(false);
        return;
      }

      router.push("/login?passwordReset=success");
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
      setLoading(false);
    }
  }

  return (
    <AdminAuthFrame
      title="Forgot Password?"
      description="Enter your admin email address and we will send reset instructions to restore access."
    >
      {step === "request" ? (
        <form onSubmit={onRequest} className="space-y-5" data-testid="forgot-password-form">
          <label className="block space-y-2">
            <span className="text-base font-medium text-white">Email Address</span>
            <Input
              aria-label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address"
              className="rounded-lg border-white/5 bg-[var(--color-surface-elevated)] px-4 py-3.5 text-[0.95rem] focus:border-[var(--color-primary)]"
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--color-success)]">{message}</p> : null}
          <Button className="mt-4 w-full rounded-lg py-3.5 text-base" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Send Reset Code"}
          </Button>
        </form>
      ) : null}

      {step === "verify" ? (
        <form onSubmit={onVerify} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-base font-medium text-white">Reset Code</span>
            <Input
              aria-label="Reset Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter reset code"
              className="rounded-lg border-white/5 bg-[var(--color-surface-elevated)] px-4 py-3.5 text-[0.95rem] focus:border-[var(--color-primary)]"
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--color-success)]">{message}</p> : null}
          <Button className="mt-4 w-full rounded-lg py-3.5 text-base" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      ) : null}

      {step === "complete" ? (
        <form onSubmit={onComplete} className="space-y-4">
          <PasswordField label="New Password" value={password} onChange={setPassword} />
          <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
          <ul className="space-y-2 pl-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">
            {rules.map((rule) => (
              <li key={rule.label}>• {rule.label}</li>
            ))}
          </ul>
          {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--color-success)]">{message}</p> : null}
          <Button className="w-full rounded-lg py-3.5 text-base" type="submit" disabled={loading}>
            {loading ? "Completing..." : "Set New Password"}
          </Button>
        </form>
      ) : null}
      <div className="mt-6 text-left">
        <Link href="/login" className="text-sm font-medium text-[var(--color-primary)]">
          Back to Log In
        </Link>
      </div>
    </AdminAuthFrame>
  );
}
