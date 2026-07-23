import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/session";
import { getAdminShellViewModel } from "@/features/admin";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";

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

  const shellViewModel = getAdminShellViewModel({
    activeHref: "",
    fullName: session.fullName ?? session.email,
  });

  return (
    <AdminDashboardShell viewModel={shellViewModel} chrome>
      {children}
    </AdminDashboardShell>
  );
}
