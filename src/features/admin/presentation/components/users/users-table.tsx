import Link from "next/link";
import type { UserManagementRow, UserManagementViewModel } from "@/features/admin/domain/entities/users";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminErrorState,
  AdminPaginationFooter,
  AdminRowMenuIcon,
  AdminSearchIcon,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildUsersHref } from "@/features/admin/presentation/state/users-route-state";

function paginationHref(viewModel: UserManagementViewModel, page: number) {
  return buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, page });
}

function UsersTableLoading() {
  return (
    <div className="space-y-3 px-3 py-4">
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-[64px_180px_180px_1fr_1.2fr_72px] items-center">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <span key={`${rowIndex}-${cellIndex}`} className="mx-2 h-6 animate-pulse rounded bg-white/8" />
          ))}
        </div>
      ))}
    </div>
  );
}

function UsersTableEmpty() {
  return (
    <div className="px-8 py-16 text-center">
      <p className="text-[18px] font-medium text-white/90">No Data here Yet</p>
    </div>
  );
}

function UsersTableError({ message }: { message?: string }) {
  return <AdminErrorState title="Unable to load users" message={message} />;
}

function RegisteredHeader() {
  return (
    <div className="grid grid-cols-[64px_180px_180px_1fr_1.2fr_72px] bg-[var(--color-surface-muted)] px-3 py-[9px] text-[10px] font-medium text-white/70">
      <span>S/N</span>
      <span>User ID</span>
      <span>Registration Date</span>
      <span>Name</span>
      <span>Email</span>
      <span>Action</span>
    </div>
  );
}

function DeletedHeader() {
  return (
    <div className="grid grid-cols-[64px_134px_134px_1fr_134px_1fr_72px] bg-[var(--color-surface-muted)] px-3 py-[9px] text-[10px] font-medium text-white/70">
      <span>S/N</span>
      <span>User ID</span>
      <span>Name</span>
      <span>Email</span>
      <span>Deletion Date</span>
      <span>Reason</span>
      <span>Action</span>
    </div>
  );
}

function DeactivatedHeader() {
  return (
    <div className="grid grid-cols-[64px_180px_1fr_1.2fr_180px_72px] bg-[var(--color-surface-muted)] px-3 py-[9px] text-[10px] font-medium text-white/70">
      <span>S/N</span>
      <span>User ID</span>
      <span>Name</span>
      <span>Email</span>
      <span>Deactivated</span>
      <span>Action</span>
    </div>
  );
}

function UserActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: UserManagementRow;
  viewModel: UserManagementViewModel;
  onView?: (row: UserManagementRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;

  return (
    <AdminActionMenuPanel className={`absolute right-0 z-50 ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
      <button
        type="button"
        onClick={() => onView?.(row)}
        className="block w-full border-b border-white/10 px-4 py-2 text-left text-[14px] text-white/90 hover:bg-white/[0.04]"
      >
        View Profile
      </button>
      {viewModel.activeTab === "registered" ? (
        <Link
          href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, deactivate: row.id })}
          className="block px-4 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
        >
          Deactivate Account
        </Link>
      ) : null}
      {viewModel.activeTab === "deactivated" ? (
        <Link
          href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, reactivate: row.id })}
          className="block px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]"
        >
          Reactivate Account
        </Link>
      ) : null}
    </AdminActionMenuPanel>
  );
}

function SearchBar({ viewModel }: { viewModel: UserManagementViewModel }) {
  return (
    <form action="/users" className="flex items-center gap-2">
      <input type="hidden" name="tab" value={viewModel.activeTab} />
      {viewModel.phaseState !== "populated" ? <input type="hidden" name="state" value={viewModel.phaseState} /> : null}
      <div className="relative w-[290px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          <AdminSearchIcon />
        </span>
        <input
          name="q"
          defaultValue={viewModel.searchQuery}
          placeholder="Search by name,email,user ID"
          className="h-[36px] w-full rounded-[8px] bg-[var(--color-surface-muted)] pl-9 pr-4 text-[12px] text-white/75 outline-none placeholder:text-white/30"
        />
      </div>
    </form>
  );
}

function RegisteredRows({
  viewModel,
  onOpenMenu,
  onView,
}: {
  viewModel: UserManagementViewModel;
  onOpenMenu?: (row: UserManagementRow) => void;
  onView?: (row: UserManagementRow) => void;
}) {
  return (
    <>
      {viewModel.rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[64px_180px_180px_1fr_1.2fr_72px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85">
          <span>{row.id}</span>
          <span>{row.userId}</span>
          <span>{row.registrationDate}</span>
          <span>{row.name}</span>
          <span>{row.email}</span>
          <div className="relative flex justify-end text-white/82">
            <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for user ${row.id}`}>
              <AdminRowMenuIcon />
            </button>
            {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? <UserActionMenu row={row} viewModel={viewModel} onView={onView} /> : null}
          </div>
        </div>
      ))}
    </>
  );
}

function DeletedRows({
  viewModel,
  onOpenMenu,
  onView,
}: {
  viewModel: UserManagementViewModel;
  onOpenMenu?: (row: UserManagementRow) => void;
  onView?: (row: UserManagementRow) => void;
}) {
  return (
    <>
      {viewModel.rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[64px_134px_134px_1fr_134px_1fr_72px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85">
          <span>{row.id}</span>
          <span>{row.userId}</span>
          <span>{row.name}</span>
          <span>{row.email}</span>
          <span>{row.deletionDate}</span>
          <span>{row.deletionReason}</span>
          <div className="relative flex justify-end text-white/82">
            <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for user ${row.id}`}>
              <AdminRowMenuIcon />
            </button>
            {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? <UserActionMenu row={row} viewModel={viewModel} onView={onView} /> : null}
          </div>
        </div>
      ))}
    </>
  );
}

function DeactivatedRows({
  viewModel,
  onOpenMenu,
  onView,
}: {
  viewModel: UserManagementViewModel;
  onOpenMenu?: (row: UserManagementRow) => void;
  onView?: (row: UserManagementRow) => void;
}) {
  return (
    <>
      {viewModel.rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[64px_180px_1fr_1.2fr_180px_72px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85">
          <span>{row.id}</span>
          <span>{row.userId}</span>
          <span>{row.name}</span>
          <span>{row.email}</span>
          <span>{row.deactivatedOn}</span>
          <div className="relative flex justify-end text-white/82">
            <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for user ${row.id}`}>
              <AdminRowMenuIcon />
            </button>
            {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? <UserActionMenu row={row} viewModel={viewModel} onView={onView} /> : null}
          </div>
        </div>
      ))}
    </>
  );
}

export function UsersTable({
  viewModel,
  onOpenMenu,
  onCloseMenu,
  onView,
}: {
  viewModel: UserManagementViewModel;
  onOpenMenu?: (row: UserManagementRow) => void;
  onCloseMenu?: () => void;
  onView?: (row: UserManagementRow) => void;
}) {
  return (
    <div className="relative max-w-[1080px] rounded-[18px] bg-[var(--color-surface-elevated)]">
      <div className="overflow-hidden rounded-[18px]">
        <div className="flex items-center justify-between gap-4 px-4 pb-4 pt-4">
          <div className="text-[16px] font-medium text-white/90">User Management</div>
          <div className="flex items-center gap-2">
            <SearchBar viewModel={viewModel} />
          </div>
        </div>

        <div className="border-t border-white/5">
          {viewModel.phaseState === "loading" ? <UsersTableLoading /> : null}
          {viewModel.phaseState === "empty" ? <UsersTableEmpty /> : null}
          {viewModel.phaseState === "error" ? <UsersTableError message={viewModel.errorMessage} /> : null}
          {viewModel.phaseState === "populated" && viewModel.activeTab === "registered" ? <><RegisteredHeader /><RegisteredRows viewModel={viewModel} onOpenMenu={onOpenMenu} onView={onView} /></> : null}
          {viewModel.phaseState === "populated" && viewModel.activeTab === "deleted" ? <><DeletedHeader /><DeletedRows viewModel={viewModel} onOpenMenu={onOpenMenu} onView={onView} /></> : null}
          {viewModel.phaseState === "populated" && viewModel.activeTab === "deactivated" ? <><DeactivatedHeader /><DeactivatedRows viewModel={viewModel} onOpenMenu={onOpenMenu} onView={onView} /></> : null}
        </div>

        <AdminPaginationFooter
          showingLabel={viewModel.showingLabel}
          hasPreviousPage={viewModel.hasPreviousPage}
          hasNextPage={viewModel.hasNextPage}
          previousHref={paginationHref(viewModel, viewModel.page - 1)}
          nextHref={paginationHref(viewModel, viewModel.page + 1)}
        />
      </div>

      {viewModel.showActionMenu && viewModel.selectedRow ? (
        onCloseMenu ? (
          <button type="button" onClick={onCloseMenu} className="fixed inset-0 z-40" aria-label="Close users action menu" />
        ) : (
          <AdminActionMenuBackdrop href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} label="Close users action menu" />
        )
      ) : null}
    </div>
  );
}
