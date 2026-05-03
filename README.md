# D3 QR

Static QR code generator. Drop in a list of URLs (or upload a CSV), get back a print-ready PDF with one QR per page, plus per-QR PNG/SVG downloads and bulk ZIP. Fully client-side — your URLs never leave your browser.

Live at **[qr.d3cloud.io](https://qr.d3cloud.io)**.

## Why this exists

Most online QR code generators offer free creation but charge a monthly fee to "keep your codes active" — because they generate **dynamic** codes that point at a redirect URL on their servers. Cancel the subscription, every printed QR breaks. **D3 QR generates only static codes** — the URL is embedded directly in the QR pattern, so they work forever with no service to keep running.

## Features

- **Four ways to add URLs** — single field, multi-line paste, CSV drop, or load a saved batch JSON
- **Editable batch table** — inline edit URL/label, up/down reorder, bulk-select with delete, ⚠ icon on suspect URLs
- **Print-ready PDF** — one QR per page, optional header/footer (text + PNG/JPEG image), label above the QR, URL below, page numbers, Letter or A4
- **Live PDF preview** that updates as you change config
- **Per-QR PNG and SVG downloads** with optional centered logo (auto-bumps error correction to High when a logo is present, so the QR still scans cleanly)
- **Bulk ZIP exports** — one ZIP of PNGs or SVGs per batch, with collision-safe filenames derived from the row's label or URL
- **Save / load batches as JSON** so you can iterate later
- **Test all links** opens every URL in a new tab (with a confirm prompt over 20)
- **500-row warning** before things get slow
- **Light / dark / system theme** with no flash on load
- **CSP-enforced privacy** — `connect-src 'self'` blocks any outbound request, so URLs and logos can't leave the browser even by mistake

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

URLs you enter never leave your browser. The site makes zero network requests after the initial page load. The Content-Security-Policy header (`connect-src 'self'`) enforces this architecturally — not as a policy promise. To verify yourself: open DevTools → Network panel, then drop in a CSV. You'll see no requests fire.

Other security headers attached by the Cloudflare Worker:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY` (no embedding)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denies camera, microphone, geolocation, etc.

`npm audit --omit=dev` reports zero vulnerabilities in production dependencies.

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
