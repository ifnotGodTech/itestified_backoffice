import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/session";
import { defaultLandingForRole } from "@/core/auth/access";
import { AdminSplash } from "@/features/auth/presentation/components/admin-splash";

export default async function RootPage() {
  const session = await getServerSession();

  if (session) {
    redirect(defaultLandingForRole());
  }

  return <AdminSplash />;
}
