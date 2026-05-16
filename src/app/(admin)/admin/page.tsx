import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getAdminManagementViewModel } from "@/features/admin/data/services/get-admin-management-view-model";
import { AdminManagementPage } from "@/features/admin/presentation/components/admin-management-page";

export default async function AdminRoutePage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    tab?: string;
    q?: string;
    menu?: string;
    permission?: string;
    managePermissions?: string;
    invite?: string;
    createRole?: string;
    assignRole?: string;
    manageRole?: string;
    renameRole?: string;
    remove?: string;
    success?: string;
    successType?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getAdminManagementViewModel({
    state: params.state,
    tab: params.tab,
    q: params.q,
    menu: params.menu,
    permission: params.permission,
    managePermissions: params.managePermissions,
    invite: params.invite,
    createRole: params.createRole,
    assignRole: params.assignRole,
    manageRole: params.manageRole,
    renameRole: params.renameRole,
    remove: params.remove,
    success: params.success,
    successType: params.successType,
    fullName: user?.fullName,
  });

  return <AdminManagementPage viewModel={viewModel} />;
}
