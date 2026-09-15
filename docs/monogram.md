# LA monogram

The SVG masters use the original L and A outlines from the shipped OFL-licensed
Frank Ruhl Libre Latin font, instantiated at weight 800 (the header's LA weight).
The glyphs retain their original proportions and contours. A is moved 120 font
units right and 100 units down; the overlap covers the L terminal cleanly.
The paths are filled separately. Since 16 September 2026 the L carries an SVG mask that subtracts the A outline stroked 30 units wide (a 15-unit transparent gap, about 1.5% of the mark), so wherever the L passes behind the A there is a clean separation and the A reads as the front letter. The cut is transparent, so the same file works on paper and on the vermilion card. It is only applied to `la-monogram.svg` and `la-monogram-white.svg`; the favicon and its PNGs keep the plain overlap because the gap is invisible at 32 px. The plain masters are kept as `la-monogram-plain.svg` and `la-monogram-white-plain.svg`. The three `la-webs-icon-*.png` files from the generated image were deleted (nothing referenced them).

- `public/la-monogram.svg`: vermilion mark, transparent background.
- `public/la-monogram-white.svg`: warm white mark for the red back card.
- `public/favicon.svg`: mark on a warm paper background, with PNG fallbacks.
- `public/images/la-webs-share-v3.jpg`: 1200 x 630 homepage sharing card (WhatsApp, Facebook, iMessage).
  Designed in `scripts/share-card.html` (vermilion block with three project cards and the
  white monogram, paper side with the wordmark, headline and domain pill) and rendered with
  `node scripts/render-share.mjs` through the Playwright already installed for tests.
  JPEG at quality 86 keeps it around 100 KB, under WhatsApp's large-preview limit.
  `la-webs-share-v2.png` is the plain monogram version it replaced.

The header and footer wordmarks remain accessible live text. Project sharing
images remain specific to each project. WhatsApp's actual preview depends on
its cache and the published Open Graph metadata; local browser QA cannot prove
that an existing WhatsApp preview has refreshed.

## Regeneration

With Python `fonttools` and `brotli` installed, run `python scripts/build-monogram.py`.
With Node `sharp` installed, run `node scripts/render-monogram.mjs`; an optional
module path argument supports a shared tooling installation. Font licensing is
in `public/fonts/`. Normal builds consume the committed assets without these tools.

Validated at 32 px, in the mobile card fan, and in the sharing image. Browser QA
also checked live-text wordmarks, favicon links, homepage/project OG separation,
mobile overflow, and runtime errors. Screenshots: `output/branding/monogram-mobile.png`
and `output/branding/monogram-desktop.png`.
