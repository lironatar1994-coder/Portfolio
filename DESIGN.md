# LA webs — design (v2, September 2026)

This records the redesign implemented in `src/styles.css`, `src/index.html`, `src/app.js`, `src/projects.mjs` and `scripts/build.mjs`. Product truth is in [PRODUCT.md](PRODUCT.md); the reference research is in [docs/studio-research.md](docs/studio-research.md). CSS is the source of truth for values.

## Direction

A bright, high-contrast canvas that lets the work carry the color. The studio's own surfaces are near-white paper and near-black ink with one vermilion accent. Every project section takes the client's real brand color (sampled from the live site, see `docs/project-longcaptures.json`), so darkness and color appear only where the work brings them. This follows what Israeli studios serving brands and small businesses do (light canvases), rather than the dark canvases common among startup-facing studios.

Identity is typographic: the wordmark `LA webs` set in Frank Ruhl Libre with a vermilion square "period" that recurs as kicker bullet, list marker, favicon and cursor dot. The previous asterisk mark was retired.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#fbfaf7` | Page, header pills, studio and footer |
| `--ink` | `#14130f` | Type, CTA pills |
| `--muted` | `#66635a` | Kickers, captions |
| `--line` | `#e6e2d9` | Rules |
| `--accent` | `#d1341c` | Brand dot, kickers, contact block, focus rings |
| `--bg` / `--fg` / `--accent` / `--soft` | per project | Set inline on every project row, reel slide and case cover from `projects[].colors` |

Type: **Frank Ruhl Libre** (variable 300–900, self-hosted) for display, weight 800, line-height ≈1.0, tracking −0.015em to −0.02em. **IBM Plex Sans Hebrew** (400–700, self-hosted as "Plex Hebrew") for body and UI at 17px/1.65. Both are OFL; licenses sit next to the files in `public/fonts/`.

## Composition

- **Hero:** speaks to the client. "נבנה לעסק שלך אתר תדמית [מושקע]." with the last word rotating every 2.6s (מושקע, מעוצב, מדויק, מהיר, מצליח) in a fixed-width slot while a vermilion underline redraws; the period is vermilion like the wordmark's. The heading keeps a static `aria-label`, updated per word. Two-line intro, actions, a fact line, and the Koral flagship (browser plus floating phone on desktop, a phone on mobile fed by a small dedicated crop `koral-hero-mobile.webp` so the first screen never waits on a huge decode). The five-project index follows.
- **Work, three pinned then two cards.** Koral, Miryam and Pinhas are sticky stages (`100svh + --scroll`, about one screen of pinned scrolling each, derived from the phone capture length). Scroll progress drives the registered `--p` property (`animation-timeline: view()`, `animation-range: contain`, JavaScript fallback elsewhere) and moves the captures top to bottom, with travel capped at 2,600px for phones and 2,200px for browsers so the phone never races the finger. Each stage has its own composition: Koral browser plus floating phone; Miryam phone beside the draggable before/after; Pinhas one wide browser frame. Phones show a wide phone window only. After the stages comes "הקטלוג שלנו.", a one-line carousel of every project (catalogs first): portrait cards in the project's color with the phone capture rising from the bottom and the name beside an arrow. Native scroll-snap, swipe on touch, drag and round arrow buttons on desktop; on touch the captures move with the page, on desktop hovering a card scrolls its capture. The same component closes every case page with the other projects. It is the place that grows as projects are added, so the pinned showcases stay three. Short-height screens and reduced motion use ordinary rows. A JavaScript fallback drives the hero, stages and catalog cards in browsers without CSS scroll timelines (verified by forcing it in Chromium).
- **Studio:** statement, three numbered steps, and deliverables; unchanged by the refinement.
- **Contact:** vermilion block with deliberately grouped headline lines and separated phone text. The small paper-colored floating WhatsApp control appears after the hero and hides only over the contact section, so the direct contact route stays available throughout the work.
- **Footer:** oversized wordmark with the vermilion period.
- **Case pages, visual first:** title, two sentences, scope chips and the live link, then a row in the project's color with two windows side by side, the desktop capture and the phone capture, each the whole home page scrolling inside itself (keyboard-focusable regions). The two windows are desktop only: on phones nested scrolling fights the page, so the case page uses the same pinned phone stage as the home page there, the capture scrolling with the finger. Miryam adds the draggable before/after. "הפרויקט הבא" was replaced by a swipeable strip of the other projects (native scroll-snap, image plus name and category, hover scrolls the preview on desktop). No story blocks, palette, or crops; the visitor reads two sentences and then uses the site. `src/presentation.mjs` keeps only the one-line showcase summaries.

## Less copy, stronger hierarchy

The hero has no fact line. The work section opens with a single title, "אתרים שבנינו." with the vermilion period, above a hairline and close to the first stage. Projects carry no category kicker anywhere (home stages, cards, case hero, strip). The numeral took over the accent role the kicker had: set in the display face at 30px in the project's accent color with a short accent rule beside it, and darkened toward the ink on light rows so it clears 3:1. Stage titles grew a step and descriptions sit at 17–21px, so each stage reads numeral → name → one line → chips → actions.

## Phones

Phones get their own composition rather than a squeezed desktop. The phone hero is a hand of cards: one card per website (its phone capture as the face, its brand color, its name with the accent square in the corner) plus a vermilion LA webs card at the back that links to the work. The front card stands upright, the rest fan behind it around a low pivot like a hand of playing cards; a swipe shuffles the front card away with a flick, a tap on a card behind brings it forward, a tap on the front card opens the project. Until the visitor touches it the hand shuffles gently on its own every few seconds and pauses off screen; reduced motion shows a static fan. The browser/phone frame of the desktop hero is hidden on phones, so nothing is scrolled through twice: scroll-throughs belong to the three stages only. Card faces are 585×820 crops (`<slug>-card.webp`, 16–38KB each). In each pinned stage the copy sits at the top under the header and the site window stretches to fill everything below it, so the capture is as large as the screen allows and scrolls with the finger; a small "גללו כדי לדפדף באתר" pill fades out as progress begins. Catalog cards use the same wide-window language, and on touch devices their captures scroll with the page instead of on hover (the hover hint is hidden there). Case pages show the phone capture in the cover window instead of a shrunken desktop screenshot, and drop the separate "בטלפון" section since the visitor is already on one. Tap targets are at least 40–48px, the header respects the notch safe area, and the studio steps put the numeral beside the title to save height. Short landscape screens and reduced motion fall back to unpinned rows with a fixed-height window. No count of projects appears anywhere in the copy; the studio speaks about experience, not quantity.

## Motion and accessibility

Reveal-on-scroll, a one-time hero entrance, scroll-linked captures, a cursor dot with a "לצפייה" label over work (fine pointers only), magnetic pills and cross-document view transitions. `prefers-reduced-motion` disables all of it and shows captures at their top. Focus rings are 3px accent. Header controls sit in translucent pills so they read over any project color. Skip link, RTL, isolated Latin and labelled comparison controls are in place. Playwright + axe cover serious/critical WCAG 2.1 AA issues on home and a case page.

## Assets

`scripts/capture-long.cjs` captures each live site full-page at 1440px (desktop, ≤6400px tall) and 390px (phone, 1.5× → 585px wide, ≤6000px tall), converts to WebP and records height, dominant background colors, CSS custom properties and computed font families in `docs/project-longcaptures.json`. The build reads that file for image dimensions. `*-desktop.webp` viewport captures are kept for `og:image`.
