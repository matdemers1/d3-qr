import { IconButton, Tooltip } from '@d3cloud/ui';
import { useTheme, type Theme } from '../../hooks/useTheme';

const LABELS: Record<Theme, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
};

const NEXT: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

function Icon({ theme }: { theme: Theme }) {
  const common = {
    viewBox: '0 0 24 24',
    width: 16,
    height: 16,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 22h8M12 18v4" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  // The name says what it is now and what a press does, so the three-way cycle
  // is not a guess; the tooltip shows the same on hover and on focus.
  const label = `${LABELS[theme]}. Switch to ${LABELS[NEXT[theme]].toLowerCase()}`;
  return (
    <Tooltip content={label}>
      <IconButton
        icon={<Icon theme={theme} />}
        label={label}
        onClick={cycleTheme}
      />
    </Tooltip>
  );
}
