import type { DragEvent, ReactNode } from 'react';

interface Props {
  active: boolean;
  /** Id of the visible heading that names this zone. */
  labelledBy: string;
  onActivate: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: () => void;
  size?: 'md' | 'sm';
  children: ReactNode;
}

/**
 * The drop target for a file, and a button that opens the picker. Three copies
 * of this had grown in the app — CSV, logo, and the PDF header and footer
 * images — each with its own keyboard handling. The design system has no drop
 * zone, so it lives here on system tokens.
 */
export function DropZone({
  active,
  labelledBy,
  onActivate,
  onDrop,
  onDragOver,
  onDragLeave,
  size = 'md',
  children,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-labelledby={labelledBy}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`cursor-pointer rounded-md border border-dashed text-center transition-colors ${
        size === 'sm' ? 'px-2.5 py-2 text-xs' : 'p-4 text-sm'
      } ${
        active
          ? 'border-accent bg-accent-muted'
          : 'border-border-field bg-bg hover:border-accent'
      }`}
    >
      {children}
    </div>
  );
}
