# Portfolio browser validation

Final local build validated on **10 September 2026** at `http://127.0.0.1:4173` using Playwright and headless Microsoft Edge.

**Result: 28 passed, 2 intentional skips, 0 failed — 49.7 seconds.**

The skipped checks avoid running desktop navigation as a mobile menu, and avoid duplicating the viewport sweep in the mobile project.

## Verified behavior

- Hebrew `lang="he"`, RTL document, one main heading, five initial portfolio projects.
- Filters: two brand sites, two catalogue sites, one system, and complete reset to all five.
- Mobile menu opens by keyboard, transfers focus into navigation, closes on Escape with focus restored, and closes after selecting a link.
- Native service disclosures open and close using the keyboard.
- Direct routes for Koral, LIBI, Miryam, Pinhas and Reuven return HTTP 200, render the correct project and verified live-site link, and load their imagery.
- No captured JavaScript errors, console errors, failed local resources or broken visible images on the homepage and all five case studies.
- No horizontal document/body overflow at 390px and 1440px on all checked routes, plus a 320px, 768px and 1024px sweep on homepage and Koral case study.
- Axe found **no serious or critical WCAG 2 A/AA or WCAG 2.1 A/AA violations** on homepage and Koral case study at desktop and mobile widths. Earlier small-text contrast findings were resolved in the final build.
- Reduced-motion preference keeps the hero gallery steady under pointer movement.
- Without JavaScript, navigation, five project links and native disclosures remain usable on desktop and mobile.

Automated accessibility checks cover their available rules; this is not a certification or an exhaustive assistive-technology audit.

## Final screenshots

Desktop viewport: **1440×1000**. Mobile viewport: **390×844**. Full-page captures show the complete document at each viewport width.

- [Desktop homepage](home-desktop.png)
- [Desktop homepage first viewport](home-desktop-viewport.png)
- [Mobile homepage](home-mobile.png)
- [Mobile homepage first viewport](home-mobile-viewport.png)
- [Koral desktop case](case-koral-desktop.png)
- [Koral mobile case](case-koral-mobile.png)
- [LIBI desktop case](case-libi-desktop.png)
- [LIBI mobile case](case-libi-mobile.png)

The final desktop/mobile hero and LIBI captures were visually opened and confirmed to contain rendered content and project imagery. All eight files were refreshed during the final passing run. LIBI is shown using its actual mobile website screenshot and project artwork.

## Reproduction

Start the local server separately, then run:

```powershell
$env:CAPTURE_QA='1'
npm run test:browser
```

Omit `CAPTURE_QA` for behavior verification without a fresh screenshot batch. Test source: `tests/portfolio.spec.js`. Browser configuration: `playwright.config.js`. HTML report: `docs/qa/playwright-report/index.html`.

This evidence is for the local portfolio build. Production project URLs were inspected separately in `docs/project-inventory.md`; no portfolio deployment was performed by this validation run.
