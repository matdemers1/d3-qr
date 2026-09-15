// Applies a remembered theme choice before first paint.
//
// A file, not an inline <script>: the Worker's CSP is `script-src 'self'`, so
// the inline version in index.html was blocked in production and every visitor
// who had chosen a theme saw the other one until React loaded. Loaded
// synchronously from <head> for the same reason it existed.
//
// "system" is the absence of the attribute — the design system follows
// prefers-color-scheme on its own when <html> carries no data-theme.
(function () {
  try {
    var stored = localStorage.getItem('d3qr-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (_) {
    // Storage blocked: follow the system.
  }
})();
