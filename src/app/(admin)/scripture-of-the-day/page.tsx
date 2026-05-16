import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getScriptureOfTheDayViewModel } from "@/features/admin/data/services/get-scripture-of-the-day-view-model";
import { ScriptureOfTheDayPage } from "@/features/admin/presentation/components/scripture-of-the-day-page";

export default async function ScriptureOfTheDayRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    filter?: string;
    count?: string;
    from?: string;
    to?: string;
    status?: string;
    menu?: string;
    view?: string;
    edit?: string;
    remove?: string;
    saved?: string;
    deleted?: string;
    scripture?: string;
    prayer?: string;
    bibleText?: string;
    bibleVersion?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getScriptureOfTheDayViewModel({
    fullName: user?.fullName,
    tab: params.tab,
    q: params.q,
    filter: params.filter,
    count: params.count,
    from: params.from,
    to: params.to,
    status: params.status,
    menu: params.menu,
    view: params.view,
    edit: params.edit,
    remove: params.remove,
    saved: params.saved,
    deleted: params.deleted,
    scripture: params.scripture,
    prayer: params.prayer,
    bibleText: params.bibleText,
    bibleVersion: params.bibleVersion,
  });

  return <ScriptureOfTheDayPage viewModel={viewModel} />;
}
