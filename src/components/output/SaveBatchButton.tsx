import { saveAs } from 'file-saver';
import { Button } from '@d3cloud/ui';
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
    <Button onClick={handleSave} disabled={rowCount === 0}>
      Save batch
    </Button>
  );
}
