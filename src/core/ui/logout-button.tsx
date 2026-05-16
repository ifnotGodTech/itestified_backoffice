"use client";

import { useLogout } from "@/core/auth/use-logout";
import { Button } from "@/core/ui/button";

export function LogoutButton() {
  const { loading, logout } = useLogout();

  return (
    <Button variant="ghost" onClick={() => logout()} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
