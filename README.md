# LA webs portfolio

Hebrew-only, RTL studio portfolio. A typographic hero, one grid of every live project as a card in the client's own brand color, static case pages with the desktop and phone captures, a before/after demo for Miryam, and direct WhatsApp/phone contact. No admin panel, database, framework, analytics or external requests. Design notes are in [DESIGN.md](DESIGN.md).

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

- Projects, copy, scope, brand colors, palette and typefaces: `src/projects.mjs`. `colors.bg/fg/accent` drive the work cards and the case-page covers. The card order on the home page is the `order` array in `scripts/build.mjs`.
- Homepage copy (work title, studio section): `src/index.html`. Shared header, hero, work grid, contact, footer and case templates: `scripts/build.mjs`.
- Styles: `src/styles.css`. Interactions (menu, hiding header, hand of cards, reveal, floating WhatsApp, cursor, before/after): `src/app.js`.
- Live-site captures: run `node scripts/capture-long.cjs` (set `KINDS=mobile` or `KINDS=desktop` to refresh one kind). It writes `public/images/<slug>-desktop-full.webp`, `<slug>-mobile-full.webp` and `docs/project-longcaptures.json`, which the build reads for image dimensions. The script uses the Playwright and sharp installs in the neighbouring `KoralEvents - Copy` project.
- One-line project summaries shown on the desktop work cards: `src/presentation.mjs`. The crop coordinates and `basis` record in that file are no longer rendered anywhere and can be removed when convenient.
- Card faces for the phone hero and the work cards, `public/images/<slug>-card.webp`, are 585×820 crops of the top of each mobile capture; regenerate them after a recapture. `blank.webp` is the 2px mobile source for the desktop hero frame, which phones hide.
- Add a project: append it to `src/projects.mjs` and `src/presentation.mjs`, capture it, and add a `<slug>-desktop.webp` viewport capture for `og:image`.

## Images to create

The website-value section uses two user-provided WhatsApp screenshots in `public/images/whatsapp-*-example.*`. Their original proportions are preserved and links open the full-size images. The contact section uses `contact.webp`. Earlier studio/process generated images remain archived; they are no longer displayed. Asset provenance is recorded in `docs/website-value-release.md`.

## Deployment

`dist/` is the standalone static site: the homepage, eight `/work/<slug>/` routes, a 404 page, fonts and images. Serve each directory's `index.html` and use `404.html` for missing pages. The default build is a private review build with `noindex,nofollow` and a disallowing robots file. For production set the confirmed domain:

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
- `docs/image-prompts.md`: the prompts behind the five section photographs, plus the install steps.
- `docs/generated-images-v1/`: the generated sources and the manifest recording what produced each one.

Font licenses (SIL OFL) for Frank Ruhl Libre and IBM Plex Sans Hebrew are in `public/fonts/`.
