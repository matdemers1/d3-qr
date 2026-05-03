# CLAUDE.md — D3 QR

Static QR code generator. Fully client-side React SPA hosted on Cloudflare Workers at `qr.d3cloud.io`. **No backend, no database, no auth.**

Read this before doing any work in this repo. The full planning docs live in the D3 Cloud Vault — start there for architecture context.

## Vault Documentation

| Doc | Path |
|-----|------|
| Discovery & Requirements | `../D3 Cloud Vault/D3 QR/Discovery & Requirements.md` |
| Architecture | `../D3 Cloud Vault/D3 QR/Architecture.md` |
| Scope of Work | `../D3 Cloud Vault/D3 QR/Scope of Work.md` |
| ADRs | `../D3 Cloud Vault/D3 QR/ADR-*.md` |
| Project Overview | `../D3 Cloud Vault/Master Notes/Overviews/D3 QR Overview.md` |

When picking up a new development session, run `/start-development d3-qr` to load this context.

## Key Conventions

- **No backend, ever.** See `ADR-001 — Client-Side Only`. Anything requiring a server is out of scope by design.
- **No analytics, no telemetry.** The privacy guarantee is architectural, not policy. CSP `connect-src 'self'` enforces it.
- **No `dangerouslySetInnerHTML`.** Ever.
- **Bundle budget:** 250kb gzipped. Audit bundle on every dependency add.
- **All `lib/` modules are pure functions.** No React coupling — easy to unit-test.
- **Single Zustand store** at `src/store/batch.ts`. No Context, no prop drilling.
- **Standard PDF font (Helvetica)** via `pdf-lib`. No font-file embedding to keep bundle small.
- **PNG and SVG logos only** for QR embedding. Reject JPEG (white backgrounds break QR contrast).
- **ECL auto-bumps to H** when a logo is uploaded.
- **No co-author footer in commits.**

## Build & Dev Commands

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # outputs dist/
npm run preview      # preview the production build
npm run test         # vitest
npm run lint         # eslint
npm run format       # prettier --write .
npx wrangler deploy  # manual deploy (auto-deploy on push to main is preferred)
```

## Architecture (one-paragraph version)

User loads the page once from Cloudflare Workers (Static Assets binding). Everything after that runs in the browser:

- **Input** — Single-URL field, multi-line textarea, CSV drop zone, or load-from-JSON
- **State** — Zustand store holds rows + config; theme is the only thing in localStorage
- **QR engine** (`src/lib/qr.ts`) — Uses `qrcode` to generate PNG/SVG; composites a logo onto the center via canvas (PNG) or SVG injection (SVG); auto-bumps ECL to H when a logo is present
- **PDF engine** (`src/lib/pdf.ts`) — Uses `pdf-lib` to build a PDF with one QR per page, optional header/footer (text + image), per-QR labels, page numbers; Letter or A4
- **Output** — PDF download, individual PNG/SVG, bulk ZIP via `jszip` + `file-saver`
- **Privacy** — CSP forbids outbound network calls after page load. Verify in DevTools Network tab.

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 (class-based dark mode)
- Zustand for state
- `qrcode` for QR generation
- `pdf-lib` for PDF assembly
- `papaparse` for CSV parsing
- `jszip` + `file-saver` for bulk downloads
- Cloudflare Workers (Static Assets binding) for hosting

## What NOT to Do

- Don't add a backend, an API endpoint, or a database (see ADR-001)
- Don't add analytics, telemetry, or tracking scripts
- Don't add font CDN imports
- Don't add `connect-src` exceptions to the CSP
- Don't add features that require a server to "stay alive" (the entire reason this project exists)
- Don't add `qr-code-styling` rounded-dot styling — it hurts scannability
