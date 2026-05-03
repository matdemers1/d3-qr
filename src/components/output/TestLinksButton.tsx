import { useBatchStore } from '../../store/batch';

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
    <button
      type="button"
      onClick={handleClick}
      disabled={rows.length === 0}
      title="Opens each URL in a new tab. Browsers may block pop-ups."
      className="rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-1.5 text-sm hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Test all links
    </button>
  );
}
