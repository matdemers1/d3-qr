import { useBatchStore } from '../../store/batch';
import { Button, Tooltip } from '@d3cloud/ui';

const POPUP_THRESHOLD = 20;

export function TestLinksButton() {
  const rows = useBatchStore((s) => s.rows);

  function handleClick() {
    if (rows.length === 0) return;
    if (rows.length > POPUP_THRESHOLD) {
      const ok = window.confirm(
        `This will open ${rows.length} tabs. Most browsers block bulk pop-ups — you may need to grant permission once. Continue?`,
      );
      if (!ok) return;
    }
    for (const row of rows) {
      window.open(row.url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <Tooltip content="Opens each URL in a new tab. Browsers may block pop-ups.">
      <Button onClick={handleClick} disabled={rows.length === 0}>
        Test all links
      </Button>
    </Tooltip>
  );
}
