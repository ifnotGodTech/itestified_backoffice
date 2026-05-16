import { getServerSession } from "@/core/auth/session";
import { cookies } from "next/headers";
import { getTestimoniesViewModelFromBackend } from "@/features/admin/data/services/get-testimonies-view-model";
import { TestimoniesPage } from "@/features/admin/presentation/components/testimonies-page";

export default async function TestimoniesRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    videoStatus?: string;
    screen?: string;
    state?: string;
    q?: string;
    from?: string;
    to?: string;
    category?: string;
    source?: string;
    categoryMenuOpen?: string;
    sourceMenuOpen?: string;
    menu?: string;
    view?: string;
    reject?: string;
    schedule?: string;
    edit?: string;
    archive?: string;
    remove?: string;
    filter?: string;
    settings?: string;
    statusFilter?: string;
    success?: string;
    origin?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getTestimoniesViewModelFromBackend({
    tab: params.tab,
    videoStatus: params.videoStatus,
    screen: params.screen,
    state: params.state,
    q: params.q,
    from: params.from,
    to: params.to,
    category: params.category,
    source: params.source,
    categoryMenuOpen: params.categoryMenuOpen,
    sourceMenuOpen: params.sourceMenuOpen,
    menu: params.menu,
    view: params.view,
    reject: params.reject,
    schedule: params.schedule,
    edit: params.edit,
    archive: params.archive,
    remove: params.remove,
    filter: params.filter,
    settings: params.settings,
    statusFilter: params.statusFilter,
    success: params.success,
    origin: params.origin,
    fullName: session?.fullName ?? session?.email,
    cookieHeader,
  });

  return <TestimoniesPage viewModel={viewModel} />;
}
