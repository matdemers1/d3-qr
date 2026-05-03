# D3 QR

Static QR code generator. Drop in a list of URLs (or upload a CSV), get back a print-ready PDF with one QR per page, plus per-QR PNG/SVG downloads and bulk ZIP. Fully client-side — your URLs never leave your browser.

Live at **[qr.d3cloud.io](https://qr.d3cloud.io)**.

## Why this exists

Most online QR code generators offer free creation but charge a monthly fee to "keep your codes active" — because they generate **dynamic** codes that point at a redirect URL on their servers. Cancel the subscription, every printed QR breaks. **D3 QR generates only static codes** — the URL is embedded directly in the QR pattern, so they work forever with no service to keep running.

## Features

- Single URL, multi-line paste, or CSV upload
- Editable batch table — reorder, edit labels, delete rows
- Print-ready PDF: one QR per page, with optional headers, footers, labels, and page numbers
- Letter (8.5×11") and A4 page sizes
- Per-QR PNG and SVG downloads
- Bulk ZIP export for entire batches
- Optional logo embedding in the center of each QR
- Light + dark mode
- Save/load batches as JSON files
- "Test all links" — open every URL in a tab to verify before printing

## Stack

- **Frontend:** React 19 + Vite 7 + TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **QR generation:** [`qrcode`](https://www.npmjs.com/package/qrcode)
- **PDF assembly:** [`pdf-lib`](https://pdf-lib.js.org)
- **CSV parsing:** [`papaparse`](https://www.papaparse.com)
- **ZIP packaging:** [`jszip`](https://stuk.github.io/jszip/)
- **Hosting:** Cloudflare Workers (Static Assets)
- **Backend:** None — fully client-side

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run build        # outputs dist/
npm run preview      # preview the production build locally
```

## Deploy

The repo auto-deploys to `qr.d3cloud.io` on push to `main` via the Cloudflare GitHub integration.

To deploy manually:

```bash
npx wrangler deploy
```

## Privacy

URLs you enter never leave your browser. The site makes zero network requests after the initial page load. The Content-Security-Policy header (`connect-src 'self'`) enforces this architecturally — not as a policy promise.

## Planning Documentation

Full planning docs (discovery, architecture, ADRs, scope of work) live in the D3 Cloud Vault:

- `D3 Cloud Vault/D3 QR/Discovery & Requirements.md`
- `D3 Cloud Vault/D3 QR/Architecture.md`
- `D3 Cloud Vault/D3 QR/Scope of Work.md`
- `D3 Cloud Vault/D3 QR/ADR-001 — Client-Side Only.md`
- `D3 Cloud Vault/D3 QR/ADR-002 — QR Library.md`
- `D3 Cloud Vault/D3 QR/ADR-003 — PDF Library.md`
- `D3 Cloud Vault/D3 QR/ADR-004 — Cloudflare Workers vs Pages.md`
- `D3 Cloud Vault/Master Notes/Overviews/D3 QR Overview.md`

## License

MIT — see [LICENSE](./LICENSE).
