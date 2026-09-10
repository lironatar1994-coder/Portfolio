# Validation

## v2.4 — visual case pages, 10 September 2026

Case pages reduced to title, two sentences, and the site itself: desktop and phone windows that scroll inside themselves on desktop, a pinned phone stage on phones, and a swipeable strip of the other projects instead of a single "next" link. 34 tests pass (the window test is desktop-only now; the phone test checks the stage is visible, the windows hidden, and the strip has four items). Full-page QA screenshots capture the strip at whatever horizontal position the image walk left it; in a live browser it starts at the right, as RTL expects.

## v2.3 — phone composition, 10 September 2026

Phone layouts were walked screen by screen at 390×844 and 375×667 (Edge, touch emulation) before and after the change; contact sheets live outside the repo. New mobile-only test: the pinned stage window on phones is taller than 38% of the viewport and ends inside it, the case page hides the "בטלפון" section on phones, and the case cover serves the phone capture there. Two layout bugs were found by the walk and fixed: desktop centering rules leaking into the phone column layout collapsed the stage window to its padding width, and the Miryam two-column wrapper collapsed it to a bar.

## v2.2 — three pinned showcases plus two cards, 10 September 2026

34 browser tests pass on desktop and mobile (4 skipped by design). New checks: three `.stage-track` stages and two `.card` entries on the home page, the hero word rotating with its heading label kept in sync, and the case-page whole-page window being scrollable and focusable. Screenshots regenerated. Page length at 390×844 is 8,039px (about ten screens); desktop 1440 is 7,568px.

## v2 redesign — 10 September 2026

Checks run against the local dev server (`http://127.0.0.1:4173`, Microsoft Edge via Playwright, desktop 1440×1000 and mobile 390×844 with touch):

- `npm run check`: 7 HTML pages, local references, Hebrew/RTL, one `h1` per page, JavaScript syntax.
- `npm run test:browser` (`tests/portfolio.spec.js`): homepage structure and resource errors, hero index links jumping to stages, a pinned stage staying fixed at mid-track while its phone capture is translated by scroll progress, studio steps and deliverables, mobile menu keyboard flow, five direct case routes with live links, palette swatches and intact imagery, Miryam before/after slider, width sweep at 320/768/1024, axe WCAG 2.1 A/AA serious+critical on home and a case page, reduced-motion keeps the hero capture still, no-JavaScript usability. Tests wait for entrance animations to finish before auditing contrast.
- Screenshots in this folder (`home-*`, `case-koral-*`, `case-miryam-*`, `case-libi-*`) were regenerated with `CAPTURE_QA=1` after the last fix.

Two issues were found and fixed during this pass: inactive reel tab numbers were below 4.5:1 on the darkest project color, and rotated floating phone frames added a few pixels of horizontal overflow at tablet widths. Final result is recorded in the terminal transcript of the run; the Playwright HTML report is in `playwright-report/`.

Limits: tests cover Edge only; the live client sites were captured once on this date and are not monitored; no real-device testing was performed.

## v1 — earlier notes

The previous design's review notes remain in `design-review.md` for history; they describe the retired layout.
