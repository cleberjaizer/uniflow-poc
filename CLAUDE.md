# UniFlow

Barcode label manager (demo / POC) for materials, co-workers and laundry flow.

## Stack
- Angular 22 + TypeScript, standalone components, signals, Tailwind CSS 4.
- PWA via `@angular/pwa` (service worker only active in production builds).
- i18n with Transloco. Default language is pt-BR; also en and es.
- No backend in this version: all data is demo data in the browser (localStorage). See `src/app/core/data.service.ts`.

## Conventions
- Every visible text needs a key in all three files in `public/assets/i18n/` (pt-BR, en, es). No hardcoded UI strings.
- UI is responsive: horizontal top bar on desktop, bottom tab bar and stacked content on mobile.
- Barcodes are plain text, compared case-insensitively, and must be unique across items and co-workers. Label rules are NOT defined yet; do not invent them (single place to change: `nextBarcode()` in `data.service.ts`).
- Routing uses the URL hash (`withHashLocation`) because GitHub Pages has no server rewrites.

## Build and deploy
- `npm install`, `npm start` (http://localhost:4200), `npm run build` (output in `dist/uniflow-poc/browser`).
- Deploy: push to `main`; `.github/workflows/deploy.yml` publishes to GitHub Pages with base href = repo name.
- Do not run `npm install` from a Linux shell inside a Windows-hosted folder (platform-specific `node_modules`).

## Git
- Public personal repo. Commit with the repo-local identity (Cleber Jaizer, cleberjaizer@gmail.com), never a work identity.
- Keep employer-internal information, URLs and credentials out of the repo.
