# LA webs — design (v3, September 2026)

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

- **Hero:** speaks to the client. "נבנה לעסק שלך אתר תדמית [מושקע]." with the last word rotating every 2.6s (מושקע, מעוצב, מדויק, מהיר, מצליח) in a fixed-width slot while a vermilion underline redraws; the period is vermilion like the wordmark's. The heading keeps a static `aria-label`, updated per word. Two-line intro, a "לעבודות" pill with a down arrow (it scrolls, so it points down), the WhatsApp text link, and the Koral flagship (browser plus floating phone) on desktop; the hand of cards on phones. There is no project index under the hero any more: the work is one scroll away.
- **Work, one grid.** "העבודות." above a hairline, then every project as a card in the project's own color: the phone capture rising from the bottom of the card, the name, a one-line summary and the domain on desktop, and a round arrow. Three columns on desktop, two on tablets and phones, so all eight sites are visible without a swipe. Hovering a card on desktop scrolls its capture; on touch the captures stay still. Case pages keep the one-line carousel of the other projects under "עוד עבודות." (native scroll-snap, swipe on touch, drag and round arrow buttons on desktop).
- **Why the pinned showcases went (v2 → v3).** On phones the same three projects appeared three times in a row (hand, stages, catalog), the sticky titles collided with the header pills, and the pinning was already disabled on phones. What follows in this paragraph is the v2 record. Koral, Miryam and Pinhas are sticky stages (`100svh + --scroll`, about one screen of pinned scrolling each, derived from the phone capture length). Scroll progress drives the registered `--p` property (`animation-timeline: view()`, `animation-range: contain`, JavaScript fallback elsewhere) and moves the captures top to bottom, with travel capped at 2,600px for phones and 2,200px for browsers so the phone never races the finger. Each stage has its own composition: Koral browser plus floating phone; Miryam phone beside the draggable before/after; Pinhas one wide browser frame. Phones show a wide phone window only. After the stages comes "הקטלוג שלנו.", a one-line carousel of every project (catalogs first): portrait cards in the project's color with the phone capture rising from the bottom and the name beside an arrow. Native scroll-snap, swipe on touch, drag and round arrow buttons on desktop; on touch the captures move with the page, on desktop hovering a card scrolls its capture. The same component closes every case page with the other projects. It is the place that grows as projects are added, so the pinned showcases stay three. Short-height screens and reduced motion use ordinary rows. A JavaScript fallback drives the hero, stages and catalog cards in browsers without CSS scroll timelines (verified by forcing it in Chromium).
- **Website value (14 September 2026):** One section under "למה העסק שלכם צריך אתר?" replaces the What-if and process sections. A prominent business-card message explains sharing a website in WhatsApp. Two user-provided screenshots (Koral and Pinhas Ratzon) provide real examples and link to their full-size originals. Two shorter benefits cover getting to know the business and easy contact. Desktop places the copy beside the examples; at 760px and below, the first benefit precedes a native horizontal preview strip and the two secondary benefits. No extra CTA before the existing contact block.
- **Contact:** vermilion block with deliberately grouped headline lines. The phone number sits on its own line in the display face under "או בטלפון", so it reads as a second call to action rather than a footnote. The small paper-colored floating WhatsApp control appears once the work section reaches the middle of the screen and hides over the contact section.
- **Footer:** oversized wordmark with the vermilion period, sized so the period stays inside the margin at 375px.
- **Case pages, visual first:** title, two sentences, scope chips and the live link, then a row in the project's color with two windows side by side, the desktop capture and the phone capture, each the whole home page scrolling inside itself (keyboard-focusable regions). The two windows are desktop only: on phones nested scrolling fights the page, so the case page shows one still, full-width phone capture instead. Miryam adds the draggable before/after. "הפרויקט הבא" was replaced by a swipeable strip of the other projects (native scroll-snap, image plus name and category, hover scrolls the preview on desktop). No story blocks, palette, or crops; the visitor reads two sentences and then uses the site. `src/presentation.mjs` keeps only the one-line showcase summaries.

## Less copy, stronger hierarchy

The hero and work-grid hierarchy remain unchanged. The website-value section has one heading and three concise benefits. Real WhatsApp previews provide the visual evidence; there are no separate process or hypothetical-question lists.

## Header

The header pills sit over every project color, so they slide away while the visitor scrolls down and return on the first scroll up (an `is-hidden` class toggled from a passive scroll listener, never while the menu is open or a header control has focus). This keeps the dark and vermilion sections clean and stops the pills covering section titles.

## Phones

Phones get their own composition rather than a squeezed desktop. **Screen rhythm (15 September 2026):** on phones the text hero and the hand of cards are two separate full screens (`min-height:100svh`, content centred), and the contact block is a full screen at every width. The work grid and the website-value section keep their natural length; nothing uses scroll-snap, so scrolling stays free and the iOS address-bar height change never makes a section jump. The phone hero is a hand of cards, fanned at 7.5° per card so the edges of the hand stay inside the screen: one card per website (its phone capture as the face, its brand color, its name with the accent square in the corner) plus a vermilion LA webs card at the back that links to the work. The front card stands upright, the rest fan behind it around a low pivot like a hand of playing cards; the front card follows the finger while dragging and flicks away on a decisive release (a short drag springs back), a tap on a card behind brings it forward, a tap on the front card opens the project. The hand declares `touch-action: pan-y` so the browser keeps vertical scrolling but leaves horizontal gestures to the cards; without it a touch drag is cancelled by the page scroll, which is what made swiping fail on phones at first. Verified with real touch events through the DevTools protocol. Until the visitor touches it the hand shuffles gently on its own every few seconds and pauses off screen; reduced motion shows a static fan. The browser/phone frame of the desktop hero is hidden on phones. The work grid is two columns of cards on phones, name and arrow only (summary and domain are desktop details), so eight sites fit in about two screens. Case pages show one still, full-width phone capture and drop the two desktop windows since the visitor is already on a phone. v2 record: pinned, scroll-driven showcases were desktop only; on phones they felt jerky (iOS has to fake scroll timelines in JavaScript) and, in Liron's words, anxious, so each project is an ordinary block that scrolls normally with a large still view of the site's top, no progress bar and no cue. The same applies to the phone section of every case page. Card faces are 585×820 crops (`<slug>-card.webp`, 16–38KB each). In each pinned stage the copy sits at the top under the header and the site window stretches to fill everything below it, so the capture is as large as the screen allows and scrolls with the finger; a small "גללו כדי לדפדף באתר" pill fades out as progress begins. Catalog cards use the same wide-window language, and on touch devices their captures scroll with the page instead of on hover (the hover hint is hidden there). Case pages show the phone capture in the cover window instead of a shrunken desktop screenshot, and drop the separate "בטלפון" section since the visitor is already on one. Tap targets are at least 40–48px, the header respects the notch safe area, and the process becomes a text-only vertical list at 760px and below, with small numerals beside the titles and no photographs or card shells. Short landscape screens and reduced motion fall back to unpinned rows with a fixed-height window. No count of projects appears anywhere in the copy; the studio speaks about experience, not quantity.

## Photography

The generated contact photograph remains active. The studio and process photographs are retained as unused assets. Two user-supplied WhatsApp screenshots now illustrate website sharing without image edits; their provenance is in docs/website-value-release.md.

The contact photograph is the exception and contains no red at all, because it sits on the vermilion block and any warm colour in it would fight the background. It shows hands on a keyboard rather than a face, so the studio does not claim a portrait it has not earned.

All four active photographs have empty `alt` attributes: the images are decorative and the Hebrew beside each one already carries the meaning. Prompts, the shared style spine and the install steps are in [docs/image-prompts.md](docs/image-prompts.md); the generated sources and their manifest are in `docs/generated-images-v1/`. Active slot sizes: the three process photographs 4:3 (hidden at 760px and below), contact 5:6 (16:10 on phones). Every active slot uses `object-fit: cover`. Historical studio slot: 4:5 (4:3 on phones, cropped at 62% so the sketchbook stayed in frame).

The current bounded `#studio` redesign received a fresh **ship** finish-review disposition. Build and check passed, along with all 4 focused browser tests. Responsive review screenshots are `focus-desktop.png`, `focus-mobile.png` and `focus-narrow.png`; earlier reference and before captures remain in `docs/qa/studio-redesign/`.

The bounded `.process` revision received a **ship** finish-review disposition. Build and check passed; all 6 existing focused browser tests passed. Responsive review screenshots are `process-desktop.png`, `process-tablet.png`, `process-mobile.png` and `process-narrow.png`.

## Projects

Nine live sites, all found on the studio's own server and verified public on 10 September 2026: the five original clients (Koral, Libi, Miryam, Pinhas, Reuven) plus בדרך אליך (sosbaderech.co.il, locksmith landing page), Vee (vee-app.co.il, task app), סדר (lawebs.co.il/seder, task manager) and PDF Studio (vee-app.co.il/pdf-studio). Everything is in the work grid; the hand shows six of them. Text-To-PDF and Pixel Dungeon exist in GitHub but have no public address, so they are not listed. Admin surfaces (monitor, manager) are excluded on purpose.

## Motion and accessibility

Reveal-on-scroll, a one-time hero entrance, hover-scrolled captures on the cards, a cursor dot with a "לצפייה" label over work (fine pointers only), magnetic pills and cross-document view transitions. `prefers-reduced-motion` disables all of it and shows captures at their top. Focus rings are 3px accent. Header controls sit in translucent pills so they read over any project color. Skip link, RTL, isolated Latin and labelled comparison controls are in place. Playwright + axe cover serious/critical WCAG 2.1 AA issues on home and a case page.

## Assets

`scripts/capture-long.cjs` captures each live site full-page at 1440px (desktop, ≤6400px tall) and 390px (phone, 1.5× → 585px wide, ≤6000px tall), converts to WebP and records height, dominant background colors, CSS custom properties and computed font families in `docs/project-longcaptures.json`. The build reads that file for image dimensions. `*-desktop.webp` viewport captures are kept for `og:image`.


## Mobile card ordering (14 September 2026)

The all-work red card is the last item in the hand and now also starts at its deepest visual layer. Fan slots follow forward deck order (center, right, left, outward), while stacking follows each card's unique forward depth. This avoids circular-distance placement bringing the last card beside the first. Autoplay/swiping reaches all project cards before the all-work card, then cycles back to the first. Without JavaScript, the existing alternating CSS slots use each card's source index for stacking. A source-level cycle check verified initial depth, each front card in order, wraparound, and the static CSS fallback; build/check passed.
