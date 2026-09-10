# LA Webs — design and build plan

## Direction contract

THESIS: A Hebrew design studio's living portfolio. Visitors encounter actual work in the first viewport, then explore larger individual compositions. The site itself demonstrates typographic and interaction craft.

OWN-WORLD: Warm ivory, near-black ink, vivid vermilion. Heavy Hebrew sans typography paired with a tightly drawn Latin wordmark. Flat editorial surfaces, expansive image crops, precise rules, quiet captions, strong scale changes. An abstract six-spoke mark provides a consistent identity. No ornamental card grids, imaginary business metrics, or stock team photos.

STORY: A striking first impression leads to evidence: real jewelry, events, beauty, and professional websites. Visitors open case-study pages and production links, then start a WhatsApp conversation or call the studio.

FIRST VIEWPORT: Compact full-width navigation; large two-line Hebrew headline on the right, a concise studio statement on the left; an offset three-project image ribbon spanning the lower viewport. The main work link is visible beside the statement. On mobile, headline precedes one dominant project image with a small inset second project, retaining the first-screen demonstration.

FORM: Selected by the agent under the user's explicit instruction to research and pick from the strongest studio references. Code-led implementation grounded in verified user-owned imagery; no generated comp or unapproved artwork. Signature interaction: the opening gallery gently responds to pointer position on fine-pointer devices; project images respond on hover, while all navigation works with touch and keyboard.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Content and sequence
1. Hebrew hero, studio identity, real-work previews.
2. Selected work: four substantial projects with category filters and a compact fifth listing.
3. Studio approach: concise design, development, and launch offering, without claims about team size or client results.
4. A vivid contact close with verified phone and WhatsApp links.
5. Dedicated static case-study pages with a full screenshot, project context, actual scope, next-project navigation, and public website links.

## Implementation
- Data: one hard-coded project module and one studio configuration.
- Build: generate static HTML pages, copy CSS/JavaScript and optimized WebP assets to dist.
- Interaction: accessible mobile menu, category filters, native page navigation, scroll-aware header, reduced-motion-aware gallery movement.
- Fonts: self-host Hebrew and Latin font files with swap; reserve image sizes and lazy-load below-fold assets.
- Quality: build, local links/assets, desktop/mobile screenshots, keyboard navigation, filters, mobile menu, direct case-study URLs, reduced motion and horizontal overflow.
- Delivery: source code, reproducible scripts, source attribution/research, and private preview. No changes to existing production client sites.
