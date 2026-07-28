import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getHelpFaqsViewModelFromApi } from "@/features/admin/data/services/get-help-faqs-view-model";
import { HelpFaqsPage } from "@/features/admin/presentation/components/help-faqs-page";

export default async function HelpFaqsRoute() {
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getHelpFaqsViewModelFromApi(
    { fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <HelpFaqsPage viewModel={viewModel} />;
}
