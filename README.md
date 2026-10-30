# UniFlow

Barcode label manager (demo / POC). Angular + TypeScript + Tailwind CSS, installable as a PWA, multi-language (en, pt-BR, es).
First version has **no backend**: all data is demo data kept in the browser (localStorage).

## Run locally

```
npm install
npm start          # http://localhost:4200
```

The service worker (PWA) is only active in production builds:

```
npm run build
npx http-server dist/uniflow-poc/browser -p 8080
```

## Publish on GitHub Pages

1. Push this repository to GitHub (branch `main`).
2. In the repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes to
   `https://<user>.github.io/<repo>/` (HTTPS).

Routing uses the URL hash (`/#/dashboard`) because GitHub Pages has no server rewrites.

## Notes

- Camera scanning needs HTTPS (GitHub Pages provides it) and camera permission. On desktop you can use a USB/Bluetooth scanner or type the code.
- Label/barcode rules are intentionally not defined yet; see `nextBarcode()` in `src/app/core/data.service.ts`.
- Translations live in `public/assets/i18n/*.json`.
