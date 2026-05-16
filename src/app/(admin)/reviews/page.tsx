import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getReviewsViewModel } from "@/features/admin/data/services/get-reviews-view-model";
import { ReviewsPage } from "@/features/admin/presentation/components/reviews-page";

export default async function ReviewsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    q?: string;
    filter?: string;
    rating?: string;
    from?: string;
    to?: string;
    selected?: string;
    menu?: string;
    view?: string;
    remove?: string;
    deleteAll?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getReviewsViewModel({
    state: params.state,
    q: params.q,
    filter: params.filter,
    rating: params.rating,
    from: params.from,
    to: params.to,
    selected: params.selected,
    menu: params.menu,
    view: params.view,
    remove: params.remove,
    deleteAll: params.deleteAll,
    fullName: user?.fullName,
  });

  return <ReviewsPage viewModel={viewModel} />;
}
