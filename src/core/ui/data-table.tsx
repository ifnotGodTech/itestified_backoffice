import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
}: {
  columns: Column<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border-subtle)]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--color-surface-panel)] text-[var(--color-text-secondary)]">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-3 py-2 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
              {columns.map((column) => {
                const value = row[column.key];
                return (
                  <td key={String(column.key)} className="px-3 py-2">
                    {column.render ? column.render(value, row) : (value as ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
