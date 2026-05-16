"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout(destination = "/login") {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace(destination);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    logout,
  };
}
