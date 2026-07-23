export const ADMIN_PAGE_SIZE = 20;

export function parsePageParam(page?: string | null): number {
  const parsed = Number(page);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

/** Slices a fixture array for mock/local view models so Previous/Next behave correctly without a backend. */
export function paginateRows<T>(rows: T[], page: number, pageSize: number = ADMIN_PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return {
    pageRows: rows.slice(start, start + pageSize),
    hasNextPage: rows.length > start + pageSize,
    hasPreviousPage: page > 1,
  };
}

export function formatShowingLabel(page: number, rowCount: number, total: number, pageSize: number = ADMIN_PAGE_SIZE): string {
  if (rowCount === 0) return "Showing 0 of 0";
  const start = (page - 1) * pageSize + 1;
  return `Showing ${start}-${start + rowCount - 1} of ${total}`;
}
