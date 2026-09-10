# LA Webs — implemented design

<!-- impeccable:design-schema 1 -->

This records the finished implementation in `src/styles.css`, `src/index.html`, `src/app.js`, `src/projects.mjs`, and `scripts/build.mjs`. Product truth lives in [PRODUCT.md](PRODUCT.md); research is in [docs/studio-research.md](docs/studio-research.md). Machine-readable values are in [docs/design-tokens.json](docs/design-tokens.json). CSS remains the rendering source of truth.

## Visual direction

A Hebrew studio portfolio built around real production websites, large typography, and open editorial spacing. Warm paper, dark ink, and vermilion were deliberately selected from the researched studio vocabulary. This is a considered default palette for this build, not a claim of unprecedented visual invention. The studio's distinction comes from its work, Hebrew composition, and consistent execution.

The recurring identity is the tightly spaced **LA webs** wordmark and an abstract six-spoke SVG mark. The page moves from paper and project imagery to a dark olive studio section, then a vermilion contact section and oversized wordmark footer. Fine rules organize content; shadows and shallow corners primarily frame website screenshots.

## Core tokens

| Token | Implemented value | Use |
| --- | --- | --- |
| `--paper` | `#f5f3ed` | Page, header, light controls |
| `--ink` | `#23251f` | Primary type and selected filters |
| `--accent` | `#cd371f` | Hero emphasis, mark, contact surface, focus |
| `--muted` | `#686b61` | Captions and secondary labels |
| `--rule` | `#d9d9cf` | Light section borders |
| `--dark` | `#252821` | Studio section |
| `--gutter` | `clamp(22px,4.2vw,76px)` | Main horizontal spacing |
| `--ease` | `cubic-bezier(.16,1,.3,1)` | Gallery and image transitions |

All fonts are self-hosted with `font-display: swap`. **Noto Hebrew** uses Hebrew and Latin subsets at weights 400–900. **Manrope**, weights 700–800, supplies the Latin wordmark and selected Latin labels. Base copy is 16px/1.65. Display headings use tight `-.04em` tracking and balanced wrapping. Desktop hero type is `clamp(66px,7.55vw,118px)` at weight 800; mobile uses `clamp(49px,10.3vw,77px)` and natural wrapping. The page container caps at 1680px.

## Composition and responsive behavior

- **Desktop hero:** Right-aligned two-line Hebrew headline, shorter introduction opposite it, then three linked screenshots. Miryam and Koral sit in tilted browser frames; LIBI appears as a phone. A small vermilion seal sits beside the composition.
- **Mobile at 760px and below:** 80px header, collapsible navigation, 22px gutters, stacked hero copy. The hero shows exactly two projects: dominant Koral and a smaller LIBI phone inset. Miryam and the seal are hidden. Pointer translation is disabled. Below 360px, gutters reduce to 18px and the intro/link stack.
- **Selected work:** A 12-column desktop grid alternates 7/5 and 5/7 spans, with a full-width fifth project. Filtered desktop results use equal columns. Cards stack below 500px; 500–760px uses two columns. Captions remain outside imagery and every card opens its static case page.
- **Case pages:** Shared identity, live-site link, real screenshot, project story and scope, mobile view, and next-project navigation. LIBI intentionally uses a phone-led cover because its verified live layout is phone-focused.

The tablet adjustment begins at 1100px; the wider gallery adjustment begins at 1600px. Project background colors stay project-specific, with a few contextual presentation overrides recorded in the JSON file.

## Interaction and accessibility behavior

Navigation uses normal anchors and generated HTML pages. Services use native `details`/`summary`. Small JavaScript enhancements provide category filters with pressed states and result announcements, the mobile menu, and a header rule after scrolling. The menu closes on Escape, link activation, outside click, focus leaving the header, and return to desktop width. Without JavaScript, projects remain visible and a `noscript` fallback exposes mobile navigation.

The only pointer-driven effect translates the hero gallery by at most 8px horizontally and 5px vertically on fine-pointer devices without a reduced-motion preference. Hover adds small screenshot lifts and arrow movement. Reduced motion disables animations/transitions, pointer translation, and smooth scrolling. Focus uses a 3px accent outline with a 6px offset; the contact section uses a white focus outline. A skip link, image alternatives, Hebrew language metadata, RTL direction, and isolated Latin/phone text are present.

## Content and maintenance

Five hard-coded projects come from `src/projects.mjs`: Koral Events, LIBI Diamonds, Miryam Zelig, Pinhas Ratzon, and Dfus Reuven. Imagery is captured production work or source artwork from those projects; provenance is recorded in `docs/project-inventory.md`, `docs/project-captures.json`, and `docs/project-assets.json`. No admin panel, inquiry form, invented awards, or business-result claims are part of this version. Contact links open WhatsApp or the phone dialer.

The dependency-free Node build writes a homepage, five case pages, a 404 page, CSS, JavaScript, fonts, and images to `dist`. Set `SITE_ORIGIN` for canonical URLs and a sitemap; builds without it carry `noindex,nofollow`. This document records source behavior and makes no additional testing or deployment claim.
