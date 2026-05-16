import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/session";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?redirect=%2Foverview");
  }

  if (session.mustChangePassword) {
    redirect("/reset-temporary-password");
  }

  if (session.role !== "admin") {
    redirect("/overview");
  }

  return <>{children}</>;
}
