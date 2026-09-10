# Verified portfolio inventory

Verified 10 September 2026 through the public GitHub API, local source files, HTTPS homepage requests, and Playwright screenshots of public homepages. All client homepages below returned HTTP 200. No accounts were opened, no forms submitted, and no other repository or production deployment was modified.

## Studio identity and contact

- The user explicitly confirmed the studio brand **LA Webs**.
- [Miryam Zelig's public live footer](https://miryamzelig.co.il/) credits `LAwebs`, links to `https://lawebs.co.il`, and displays the studio phone `050-861-1888` with `tel:0508611888`.
- Safe studio contact links: `tel:+972508611888` and `https://wa.me/972508611888`. The latter is derived from the verified public phone, not a separately tested WhatsApp account.
- No studio email address was verified. Do not invent one.
- The `https://lawebs.co.il/` root returned 404 during this inspection; the portfolio is a new local build and is not deployed there yet.

## Recommended selected work

| Project | Production URL | Verified public scope | Suggested portfolio presentation |
| --- | --- | --- | --- |
| Koral Events / קורל אירועים | [Live site](https://lawebs.co.il/koralevents) | Hebrew women's event discovery and registration, named public events, responsive visual homepage | Lead visual: cinematic Jerusalem gathering, expressive Hebrew typography, desktop and mobile screenshots |
| LIBI Diamonds | [Live site](https://www.libidiamonds.co.il/) | Hebrew diamond jewelry catalogue, search, category and product pages | Luxury still life with the actual mobile screenshot; current live layout stays about 393px wide even on desktop, so avoid presenting the desktop screenshot as a full-width responsive design |
| Miryam Zelig / מרים זליג | [Live site](https://miryamzelig.co.il/) | Bridal and evening makeup, portfolio gallery, before/after, WhatsApp availability CTA | Warm beauty editorial, portrait photography, desktop and mobile screenshots |
| Pinhas Ratzon / פנחס רצון | [Live site](https://pinhasratzon.co.il/) | Attorney practice site focused on real estate, property taxation and wills | Professional brand presence, dark gold palette, large portrait and clear content |
| Dfus Reuven / דפוס ראובן | [Live site](https://www.dfusreuven.co.il/) | Print services, product catalogue, product detail and quote routes | Optional fifth case to demonstrate a B2B catalogue and print identity |

Only describe visible or source-supported functionality. No conversion lifts, awards, revenue, client satisfaction quotes, engagement statistics or team size have been verified.

## Captured screenshots

Every screenshot is of the actual public homepage, at the top of the document. Desktop viewport is 1440×1000; mobile is 390×844. Fonts and visible images were allowed to load. Reduced motion was requested. Captures were compressed as WebP quality 88 without changing their contents.

All files are under `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/Portfolio/public/images/`:

- `koral-desktop.webp`, `koral-mobile.webp`
- `libi-desktop.webp`, `libi-mobile.webp`
- `miryam-desktop.webp`, `miryam-mobile.webp`
- `pinhas-desktop.webp`, `pinhas-mobile.webp`
- `reuven-desktop.webp`, `reuven-mobile.webp`

Machine-readable capture metadata and exact image sources: `docs/project-captures.json`. Capture script: `docs/capture-projects.cjs` (uses the existing local KoralEvents Playwright and sharp installations).

Visual inspection confirmed Koral's current production site uses the newer signature gathering photograph, matching the local `KoralEvents - Copy` assets. The older `KoralEvents` checkout's slideshow implementation is not representative of the live homepage.

## Project artwork provenance

The following files were copied from the user's existing local project artwork and recompressed to WebP quality 86 with proportional maximum dimensions 1600×1800; they were not created from competitor work. They are project imagery, and should appear with the corresponding project attribution. These paths are recorded exactly in `docs/project-assets.json`.

| Portfolio filename | Original absolute path | Dimensions |
| --- | --- | --- |
| `libi-hero.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/github-repos/LibiDiamondsRework/images/home/hero-01.jpg` | 1200×1600 |
| `koral-hero.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents - Copy/public/brand/hero-signature-landscape.webp` | 1536×1024 |
| `koral-hero-portrait.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents - Copy/public/brand/hero-signature-portrait.webp` | 660×1024 |
| `miryam-hero.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/github-repos/Miryam_Zelig/gallery/img1.jpeg` | 1200×1600 |
| `miryam-portrait.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/github-repos/Miryam_Zelig/gallery/hero.jpeg` | 853×1280 |
| `reuven-hero.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/github-repos/DfusReuven/public/images/hero-collage.webp` | 1600×1280 |
| `pinhas-hero.webp` | `C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/github-repos/PinhasRatzon/site/public/assets/img/hero-room.jpg` | See `project-assets.json` |

Live source image correspondence:

- LIBI: `https://www.libidiamonds.co.il/images/home/hero-01.jpg`
- Koral: `https://lawebs.co.il/Koralevents/brand/hero-signature-landscape.webp`
- Miryam: `https://miryamzelig.co.il/Miryam_Zelig/gallery/img1.jpeg?v=1783262465709`
- Reuven: `https://www.dfusreuven.co.il/images/hero-collage.webp`
- Pinhas: `https://pinhasratzon.co.il/assets/img/hero-room.jpg?v=1788040582314`

## GitHub inventory

[Public account](https://github.com/lironatar1994-coder/) and [public repository API](https://api.github.com/users/lironatar1994-coder/repos?per_page=100) verified 15 public repositories. Repository metadata currently has no public descriptions or homepages, so production URLs were established from local deployment documentation and verified live.

- [DfusReuven](https://github.com/lironatar1994-coder/DfusReuven)
- [KoralEvents2](https://github.com/lironatar1994-coder/KoralEvents2)
- [LibiDiamonds](https://github.com/lironatar1994-coder/LibiDiamonds)
- [LibiDiamonds2](https://github.com/lironatar1994-coder/LibiDiamonds2)
- [LibiDiamondsRework](https://github.com/lironatar1994-coder/LibiDiamondsRework)
- [Manager_Site](https://github.com/lironatar1994-coder/Manager_Site)
- [Miryam_Zelig](https://github.com/lironatar1994-coder/Miryam_Zelig)
- [OnYourWay](https://github.com/lironatar1994-coder/OnYourWay)
- [PinhasRatzon](https://github.com/lironatar1994-coder/PinhasRatzon)
- [PixelDungeon](https://github.com/lironatar1994-coder/PixelDungeon)
- [Seder](https://github.com/lironatar1994-coder/Seder)
- [ServerMonitor](https://github.com/lironatar1994-coder/ServerMonitor)
- [Text-To-PDF](https://github.com/lironatar1994-coder/Text-To-PDF)
- [Vee](https://github.com/lironatar1994-coder/Vee)
- [Vee-Landing-Page](https://github.com/lironatar1994-coder/Vee-Landing-Page)

The manager and server monitor are administrative applications. Their authenticated content is intentionally excluded from public portfolio assets. Multiple LIBI repositories represent the same client and should not be counted as separate clients.
