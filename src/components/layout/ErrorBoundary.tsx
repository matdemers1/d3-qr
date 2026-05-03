import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to console for debugging; no telemetry per privacy guarantee
    console.error('D3 QR crashed:', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Something broke</h1>
        <p className="max-w-prose text-sm text-[var(--color-text-muted)]">
          The page hit an unexpected error. Refresh to try again. If you saved
          your batch as JSON, you can re-load it; otherwise unsaved batch state
          is lost.
        </p>
        <pre className="max-w-prose overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-left text-xs">
          {this.state.error.message}
        </pre>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 py-2 text-sm hover:bg-[var(--color-canvas)]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
