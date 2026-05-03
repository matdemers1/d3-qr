import { useBatchStore } from '../../store/batch';
import { describeValidation, validateUrl } from '../../lib/url';
import type { BatchRow as BatchRowType } from '../../types';

interface Props {
  row: BatchRowType;
  index: number;
  total: number;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

export function BatchRow({ row, index, total, selected, onToggleSelect }: Props) {
  const updateRow = useBatchStore((s) => s.updateRow);
  const removeRow = useBatchStore((s) => s.removeRow);
  const reorderRow = useBatchStore((s) => s.reorderRow);

  const validation = validateUrl(row.url);
  const tooltip = describeValidation(validation);

  return (
    <tr className="border-b border-[var(--color-border)] last:border-b-0">
      <td className="px-2 py-1.5 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row.id)}
          aria-label={`Select row ${index + 1}`}
          className="cursor-pointer"
        />
      </td>
      <td className="px-1 py-1.5 align-middle">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => reorderRow(index, index - 1)}
            disabled={index === 0}
            aria-label="Move up"
            title="Move up"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => reorderRow(index, index + 1)}
            disabled={index === total - 1}
            aria-label="Move down"
            title="Move down"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ▼
          </button>
        </div>
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          type="text"
          value={row.url}
          onChange={(e) => updateRow(row.id, { url: e.target.value })}
          aria-label="URL"
          spellCheck={false}
          className="w-full rounded-sm border border-transparent bg-transparent px-1.5 py-1 font-mono text-xs outline-none hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:bg-[var(--color-canvas)]"
        />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          type="text"
          value={row.label ?? ''}
          onChange={(e) =>
            updateRow(row.id, { label: e.target.value || undefined })
          }
          placeholder="—"
          aria-label="Label"
          className="w-full rounded-sm border border-transparent bg-transparent px-1.5 py-1 text-xs outline-none hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:bg-[var(--color-canvas)]"
        />
      </td>
      <td className="px-2 py-1.5 text-center align-middle">
        {!validation.valid && (
          <span
            title={tooltip}
            aria-label={tooltip}
            className="text-[var(--color-warning)]"
          >
            ⚠
          </span>
        )}
      </td>
      <td className="px-2 py-1.5 align-middle">
        <button
          type="button"
          onClick={() => removeRow(row.id)}
          aria-label="Delete row"
          title="Delete row"
          className="rounded-sm px-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-error)]"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
