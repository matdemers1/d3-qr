import { saveAs } from 'file-saver';
import { useBatchStore } from '../../store/batch';
import { batchFilename, serializeBatch } from '../../lib/batch';

export function SaveBatchButton() {
  const exportBatch = useBatchStore((s) => s.exportBatch);
  const rowCount = useBatchStore((s) => s.rows.length);

  function handleSave() {
    const batch = exportBatch();
    const blob = new Blob([serializeBatch(batch)], {
      type: 'application/json;charset=utf-8',
    });
    saveAs(blob, batchFilename());
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={rowCount === 0}
      className="rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-1.5 text-sm hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Save batch
    </button>
  );
}
