# LA Webs portfolio

Hebrew-only, RTL studio portfolio with five verified projects, static case-study pages, mobile navigation, category filtering, native service disclosures, and direct phone/WhatsApp contact. No admin panel, database, analytics, or external font requests.

## Run

Requires Node.js 22 or later.

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:4173. Source and asset changes rebuild automatically; refresh the browser to see them. Changes to the server script require restarting it.

```powershell
npm run build
npm run check
npm run test:browser
```

The browser tests use Microsoft Edge. To use another installed Playwright browser, update `channel` in `playwright.config.js`. The development server must be running for browser tests.

## Update the portfolio

- Edit projects, case-study text, production links, and studio contact in `src/projects.mjs`.
- Edit homepage copy in `src/index.html` and shared header/footer/project templates in `scripts/build.mjs`.
- Styles and interactions are in `src/styles.css` and `src/app.js`.
- Place optimized images in `public/images`. Each project needs `<slug>-desktop.webp` and `<slug>-mobile.webp`; custom image compositions are defined in `projectVisual()`.
- Rebuild and verify after changing content. Filter totals and bespoke gallery compositions currently reflect the five selected projects.

## Deployment

`dist/` is the standalone static site. It contains the homepage, five directly accessible `/work/<slug>/` routes, a 404 page, and local assets. Configure a static host to serve each directory's `index.html` and `404.html` for missing pages. There is no server runtime and no SPA fallback.

The default build is a private review version with `noindex,nofollow` and a disallowing robots file. For a public production build, set the confirmed domain explicitly:

```powershell
$env:SITE_ORIGIN = 'https://your-confirmed-domain.example'
npm run build
npm run check
```

This adds canonical URLs and a sitemap, allows indexing, and removes the preview noindex tag. The example domain must be replaced. Existing client production sites are linked to, not modified. `.openai/hosting.json` identifies the separate private Sites preview.

## Research and evidence

- `docs/studio-research.md`: eight Israeli/international studio references and concrete design observations.
- `docs/build-plan.md`: direction and implementation plan.
- `docs/project-inventory.md`: verified public websites, factual scope, contact source, and asset provenance.
- `docs/project-captures.json` / `docs/project-assets.json`: original screenshot/image sources.
- `docs/qa/`: browser screenshot evidence. Set `CAPTURE_QA=1` when intentionally refreshing captures.

All project screenshots were captured from public production sites on 10 September 2026. The Libi showcase deliberately uses its real mobile layout. Font licenses are included in `public/fonts/`.
