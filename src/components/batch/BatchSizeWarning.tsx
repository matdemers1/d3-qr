import { useState } from 'react';
import { useBatchStore } from '../../store/batch';
import { Alert, Button } from '@d3cloud/ui';

const THRESHOLD = 500;

export function BatchSizeWarning() {
  const rowCount = useBatchStore((s) => s.rows.length);
  const [dismissed, setDismissed] = useState(false);

  if (rowCount < THRESHOLD || dismissed) return null;

  return (
    <Alert
      tone="warning"
      title={`Large batch: ${rowCount} rows`}
      actions={
        <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      }
    >
      Generation may slow your browser. If it struggles, split the batch and
      merge the resulting PDFs.
    </Alert>
  );
}
