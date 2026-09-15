import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-fg font-mono text-sm font-bold text-bg"
          >
            QR
          </span>
          <span className="text-sm font-semibold tracking-tight">D3 QR</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
