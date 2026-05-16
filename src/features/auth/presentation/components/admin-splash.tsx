"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminSplash() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/signup");
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6">
      <Image src="/admin-logo.svg" alt="iTestified" width={240} height={72} priority className="h-auto w-[240px]" />
    </div>
  );
}
