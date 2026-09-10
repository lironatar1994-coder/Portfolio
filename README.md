# LA webs portfolio

Hebrew-only, RTL studio portfolio. A typographic hero, five individually composed showcases in the clients' own brand colors, static case-study pages with curated capture details, palette and typography facts sampled from each live site, a before/after demo for Miryam, and direct WhatsApp/phone contact. No admin panel, database, framework, analytics or external requests. Design notes are in [DESIGN.md](DESIGN.md).

## Run

Requires Node.js 22 or later.

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:4173. Source and asset changes rebuild automatically; refresh to see them. Restart the server after editing `scripts/serve.mjs`.

```powershell
npm run build
npm run check
npm run test:browser
```

Browser tests run in Microsoft Edge (change `channel` in `playwright.config.js` for another installed browser). The dev server must be running for browser tests. Set `CAPTURE_QA=1` to refresh the screenshots in `docs/qa/`.

## Update the portfolio

- Projects, copy, scope, brand colors, palette and typefaces: `src/projects.mjs`. `colors.bg/fg/accent` drive the work row and the case-page covers.
- Homepage copy (statement, studio section): `src/index.html`. Shared header, hero, rows, contact, footer and case templates: `scripts/build.mjs`.
- Styles: `src/styles.css`. Interactions (menu, scroll progress, reveal, cursor, before/after): `src/app.js`.
- Live-site captures: run `node scripts/capture-long.cjs` (set `KINDS=mobile` or `KINDS=desktop` to refresh one kind). It writes `public/images/<slug>-desktop-full.webp`, `<slug>-mobile-full.webp` and `docs/project-longcaptures.json`, which the build reads for image dimensions. The script uses the Playwright and sharp installs in the neighbouring `KoralEvents - Copy` project.
- One-line showcase summaries: `src/presentation.mjs`. The crop coordinates and `basis` record in that file are no longer rendered anywhere and can be removed when convenient.
- Card faces for the phone hero, `public/images/<slug>-card.webp`, are 585×820 crops of the top of each mobile capture; regenerate them after a recapture. `blank.webp` is the 2px mobile source for the desktop hero frame, which phones hide.
- Add a project: append it to `src/projects.mjs` and `src/presentation.mjs`, capture it, and add a `<slug>-desktop.webp` viewport capture for `og:image`.

## Deployment

`dist/` is the standalone static site: the homepage, five `/work/<slug>/` routes, a 404 page, fonts and images. Serve each directory's `index.html` and use `404.html` for missing pages. The default build is a private review build with `noindex,nofollow` and a disallowing robots file. For production set the confirmed domain:

```powershell
$env:SITE_ORIGIN = 'https://your-confirmed-domain.example'
npm run build
npm run check
```

This adds canonical URLs, `og:image` and a sitemap and allows indexing.

## Research and evidence

- `docs/studio-research.md`: studio references and the design conclusions drawn from them.
- `docs/project-inventory.md`: verified public websites, scope, contact source and asset provenance.
- `docs/project-longcaptures.json`: capture dimensions, dominant colors, CSS variables and font families read from each live site on 10 September 2026.
- `docs/qa/`: browser screenshots and the Playwright report.

Font licenses (SIL OFL) for Frank Ruhl Libre and IBM Plex Sans Hebrew are in `public/fonts/`.
