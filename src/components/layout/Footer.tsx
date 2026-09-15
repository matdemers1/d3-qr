import { Link } from '@d3cloud/ui';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-fg-muted sm:flex-row">
        <span>
          Made by <Link href="https://d3cloud.io">D3 Cloud</Link>
        </span>
        <span>Static QR codes — your URLs never leave your browser.</span>
      </div>
    </footer>
  );
}
