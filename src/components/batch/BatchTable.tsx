import { useMemo, useState } from 'react';
import { useBatchStore } from '../../store/batch';
import { BatchRow } from './BatchRow';
import { Button, Checkbox } from '@d3cloud/ui';

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

  const allSelected = liveSelected.size === rows.length;

  return (
    <section
      aria-labelledby="d3qr-batch-heading"
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="d3qr-batch-heading"
          className="text-sm font-semibold tracking-wide text-fg-muted uppercase"
        >
          Batch <span className="font-normal">({rows.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          {liveSelected.size > 0 && (
            <Button size="sm" variant="danger-ghost" onClick={deleteSelected}>
              Delete {liveSelected.size} selected
            </Button>
          )}
          <Button size="sm" variant="danger-ghost" onClick={handleClearAll}>
            Clear all
          </Button>
        </div>
      </div>
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs text-fg-muted uppercase">
              <th className="w-8 px-2 py-2">
                {/* Indeterminate while some rows are selected: a header box
                    showing unchecked with three rows ticked says the wrong thing. */}
                <Checkbox
                  checked={
                    allSelected
                      ? true
                      : liveSelected.size > 0
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                  label={null}
                />
              </th>
              <th className="w-8 px-1 py-2">
                <span className="sr-only">Order</span>
              </th>
              <th className="px-2 py-2">URL</th>
              <th className="w-1/4 px-2 py-2">Label</th>
              <th className="w-8 px-2 py-2 text-center">
                <span className="sr-only">Status</span>
              </th>
              <th className="w-8 px-2 py-2">
                <span className="sr-only">Actions</span>
              </th>
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
    </section>
  );
}
