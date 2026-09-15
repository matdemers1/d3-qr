import { useBatchStore } from '../../store/batch';
import { describeValidation, validateUrl } from '../../lib/url';
import type { BatchRow as BatchRowType } from '../../types';
import { Checkbox, IconButton, Tooltip } from '@d3cloud/ui';

interface Props {
  row: BatchRowType;
  index: number;
  total: number;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

export function BatchRow({
  row,
  index,
  total,
  selected,
  onToggleSelect,
}: Props) {
  const updateRow = useBatchStore((s) => s.updateRow);
  const removeRow = useBatchStore((s) => s.removeRow);
  const reorderRow = useBatchStore((s) => s.reorderRow);

  const validation = validateUrl(row.url);
  const tooltip = describeValidation(validation);

  const n = index + 1;

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-2 py-1.5 align-middle">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(row.id)}
          aria-label={`Select row ${n}`}
          label={null}
        />
      </td>
      <td className="px-1 py-1.5 align-middle">
        <div className="flex flex-col">
          <Tooltip content="Move up">
            <IconButton
              size="sm"
              icon={<Chevron direction="up" />}
              label={`Move row ${n} up`}
              onClick={() => reorderRow(index, index - 1)}
              disabled={index === 0}
            />
          </Tooltip>
          <Tooltip content="Move down">
            <IconButton
              size="sm"
              icon={<Chevron direction="down" />}
              label={`Move row ${n} down`}
              onClick={() => reorderRow(index, index + 1)}
              disabled={index === total - 1}
            />
          </Tooltip>
        </div>
      </td>
      <td className="px-2 py-1.5 align-middle">
        {/* Borderless until hovered or focused: a table of framed fields reads
            as a form to fill in, and these are values to check. The ring comes
            from the system's focus rule. */}
        <input
          type="text"
          value={row.url}
          onChange={(e) => updateRow(row.id, { url: e.target.value })}
          aria-label={`URL, row ${n}`}
          aria-invalid={!validation.valid || undefined}
          spellCheck={false}
          className="w-full rounded-sm border border-transparent bg-transparent px-1.5 py-1 font-mono text-xs hover:border-border-field focus:bg-bg"
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
          aria-label={`Label, row ${n}`}
          className="w-full rounded-sm border border-transparent bg-transparent px-1.5 py-1 text-xs hover:border-border-field focus:bg-bg"
        />
      </td>
      <td className="px-2 py-1.5 text-center align-middle">
        {!validation.valid && (
          <Tooltip content={tooltip ?? 'This URL may not work'}>
            {/* Focusable, or the explanation only ever appears on hover. */}
            <span
              tabIndex={0}
              className="inline-flex text-warning"
              role="img"
              aria-label={tooltip ?? 'This URL may not work'}
            >
              <WarningGlyph />
            </span>
          </Tooltip>
        )}
      </td>
      <td className="px-2 py-1.5 align-middle">
        <Tooltip content="Delete row">
          <IconButton
            size="sm"
            icon={<CrossGlyph />}
            label={`Delete row ${n}`}
            onClick={() => removeRow(row.id)}
          />
        </Tooltip>
      </td>
    </tr>
  );
}

const glyph = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function Chevron({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg {...glyph}>
      <path d={direction === 'up' ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg {...glyph}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function WarningGlyph() {
  return (
    <svg {...glyph} width={15} height={15}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
