import { useMemo, useState } from 'react';
import { useBatchStore } from '../../store/batch';
import { BatchRow } from './BatchRow';

export function BatchTable() {
  const rows = useBatchStore((s) => s.rows);
  const removeRow = useBatchStore((s) => s.removeRow);
  const clearRows = useBatchStore((s) => s.clearRows);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const validRowIds = useMemo(() => new Set(rows.map((r) => r.id)), [rows]);
  const liveSelected = useMemo(() => {
    const next = new Set<string>();
    for (const id of selected) if (validRowIds.has(id)) next.add(id);
    return next;
  }, [selected, validRowIds]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (liveSelected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  function deleteSelected() {
    if (liveSelected.size === 0) return;
    for (const id of liveSelected) removeRow(id);
    setSelected(new Set());
  }

  function handleClearAll() {
    if (rows.length === 0) return;
    const ok = window.confirm(
      `Clear all ${rows.length} row${rows.length === 1 ? '' : 's'}? This cannot be undone (unless you saved a batch first).`,
    );
    if (!ok) return;
    clearRows();
    setSelected(new Set());
  }

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
          Batch ({rows.length})
        </h2>
        <div className="flex items-center gap-2">
          {liveSelected.size > 0 && (
            <button
              type="button"
              onClick={deleteSelected}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2.5 py-1 text-xs hover:border-[var(--color-error)] hover:text-[var(--color-error)]"
            >
              Delete {liveSelected.size} selected
            </button>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-2.5 py-1 text-xs hover:border-[var(--color-error)] hover:text-[var(--color-error)]"
          >
            Clear all
          </button>
        </div>
      </div>
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)] uppercase">
              <th className="w-8 px-2 py-2">
                <input
                  type="checkbox"
                  checked={
                    rows.length > 0 && liveSelected.size === rows.length
                  }
                  onChange={toggleAll}
                  aria-label="Select all rows"
                  className="cursor-pointer"
                />
              </th>
              <th className="w-8 px-1 py-2">#</th>
              <th className="px-2 py-2">URL</th>
              <th className="w-1/4 px-2 py-2">Label</th>
              <th className="w-8 px-2 py-2 text-center"></th>
              <th className="w-8 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <BatchRow
                key={row.id}
                row={row}
                index={idx}
                total={rows.length}
                selected={liveSelected.has(row.id)}
                onToggleSelect={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
