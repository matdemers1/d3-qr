export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-elevated)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[var(--color-text-muted)] sm:flex-row">
        <span>
          Made by{' '}
          <a
            href="https://d3cloud.io"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            D3 Cloud
          </a>
        </span>
        <span>Static QR codes — your URLs never leave your browser.</span>
      </div>
    </footer>
  );
}
