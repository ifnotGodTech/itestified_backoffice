"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { AdminAuthFrame } from "@/features/auth/presentation/components/admin-auth-frame";
import { PasswordField } from "@/features/auth/presentation/components/password-field";

const roleRoute = {
  admin: "/overview",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const passwordResetStatus = params.get("passwordReset");
  const [email, setEmail] = useState("admin@itestified.app");
  const [password, setPassword] = useState("pass123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { message?: string; role?: keyof typeof roleRoute };

      if (!response.ok || !data.role) {
        setLoading(false);
        setError(data.message ?? "Login failed.");
        return;
      }

      const redirect = params.get("redirect");
      router.push(redirect || roleRoute[data.role]);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Unable to reach the server.");
    }
  }

  return (
    <AdminAuthFrame title="Welcome Back, Admin!">
      <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
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
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter Password"
          ariaLabel="Password"
          className="rounded-lg border-white/5 bg-[var(--color-surface-elevated)] px-4 py-3.5 text-[0.95rem] focus:border-[var(--color-primary)]"
        />
        <div className="flex items-center justify-between text-[13px] text-[var(--color-text-secondary)]">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--color-primary)]" />
            <span>Remember me</span>
          </label>
          <Link href="/forgot-password" className="font-medium text-[var(--color-primary)]">
            Forgot Password?
          </Link>
        </div>
        {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
        {passwordResetStatus === "success" ? (
          <p className="text-sm text-[var(--color-success)]">Password updated successfully. Please log in.</p>
        ) : null}
        <Button className="mt-8 w-full rounded-lg py-3.5 text-base" type="submit" disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </Button>
      </form>
    </AdminAuthFrame>
  );
}
